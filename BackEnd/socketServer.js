const http = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');
const db = require('./config/db');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'campus-gigs-33f61'
  });
}

const firestore = admin.firestore();

/**
 * Socket.io + Firebase Hybrid Messaging Server
 * 
 * Socket.io: Real-time delivery for online users
 * Firebase: Persistence and offline sync
 */

function createSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Store active connections: userId -> socket.id
  const activeUsers = new Map();

  // Middleware: Verify Firebase token
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify Firebase token
      const decodedToken = await admin.auth().verifyIdToken(token);
      socket.userId = decodedToken.uid;
      socket.userEmail = decodedToken.email;
      
      console.log(`✅ Socket authenticated: ${socket.userEmail} (${socket.userId})`);
      next();
    } catch (error) {
      console.error('Socket authentication failed:', error.message);
      next(new Error('Invalid authentication token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId})`);
    
    // Track active user
    activeUsers.set(socket.userId, socket.id);
    
    // Update user presence in Firestore
    updateUserPresence(socket.userId, true);
    
    // Broadcast presence to all connected clients
    io.emit('user:online', { userId: socket.userId, online: true });

    // Join user's personal room (for direct messages)
    socket.join(`user:${socket.userId}`);

    // Handle joining a conversation room
    socket.on('conversation:join', async (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      console.log(`📱 User ${socket.userId} joined conversation ${conversationId}`);
      
      // Notify others in the conversation
      socket.to(`conversation:${conversationId}`).emit('user:joined', {
        userId: socket.userId,
        conversationId
      });
    });

    // Handle leaving a conversation room
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`📤 User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle sending a message
    socket.on('message:send', async (data) => {
      try {
        const { conversationId, text, recipientId, attachments } = data;
        
        console.log(`💬 Message from ${socket.userId} to conversation ${conversationId}`);

        // Create message object
        const message = {
          senderId: socket.userId,
          conversationId,
          text: text || '',
          attachments: attachments || [],
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          readBy: [socket.userId], // Sender has read it
          delivered: false,
          type: 'text'
        };

        // 1. Save to Firestore for persistence
        const messageRef = await firestore
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .add(message);

        // Add message ID
        message.id = messageRef.id;
        message.createdAt = new Date().toISOString(); // For immediate display

        // 2. Deliver via Socket.io to online users (instant)
        io.to(`conversation:${conversationId}`).emit('message:new', message);

        // 3. Update conversation metadata
        await firestore
          .collection('conversations')
          .doc(conversationId)
          .set({
            lastMessage: text,
            lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
            participants: admin.firestore.FieldValue.arrayUnion(socket.userId, recipientId)
          }, { merge: true });

        // 4. Send push notification if recipient is offline
        if (recipientId && !activeUsers.has(recipientId)) {
          await sendPushNotification(recipientId, {
            title: 'New message',
            body: text,
            conversationId
          });
        }

        // Acknowledge message sent
        socket.emit('message:sent', { 
          tempId: data.tempId, 
          messageId: messageRef.id,
          success: true 
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message:error', { 
          tempId: data.tempId, 
          error: error.message 
        });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('typing:user', {
        userId: socket.userId,
        conversationId,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation:${conversationId}`).emit('typing:user', {
        userId: socket.userId,
        conversationId,
        isTyping: false
      });
    });

    // Handle message read receipt
    socket.on('message:read', async (data) => {
      try {
        const { conversationId, messageId } = data;
        
        // Update in Firestore
        await firestore
          .collection('conversations')
          .doc(conversationId)
          .collection('messages')
          .doc(messageId)
          .update({
            readBy: admin.firestore.FieldValue.arrayUnion(socket.userId)
          });

        // Notify sender via Socket.io (instant)
        io.to(`conversation:${conversationId}`).emit('message:read', {
          messageId,
          userId: socket.userId,
          conversationId
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id} (User: ${socket.userId})`);
      
      // Remove from active users
      activeUsers.delete(socket.userId);
      
      // Update presence in Firestore
      updateUserPresence(socket.userId, false);
      
      // Broadcast offline status
      io.emit('user:offline', { userId: socket.userId, online: false });
    });
  });

  return io;
}

// Helper: Update user presence in Firestore
async function updateUserPresence(userId, online) {
  try {
    await firestore.collection('presence').doc(userId).set({
      online,
      lastSeen: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating presence:', error);
  }
}

// Helper: Send push notification via FCM
async function sendPushNotification(userId, payload) {
  try {
    // Get user's FCM token from Firestore
    const userDoc = await firestore.collection('fcmTokens').doc(userId).get();
    
    if (!userDoc.exists || !userDoc.data().token) {
      console.log(`No FCM token for user ${userId}`);
      return;
    }

    const token = userDoc.data().token;

    const message = {
      notification: {
        title: payload.title,
        body: payload.body
      },
      data: {
        conversationId: payload.conversationId,
        type: 'chat_message'
      },
      token
    };

    await admin.messaging().send(message);
    console.log(`📲 Push notification sent to ${userId}`);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

module.exports = { createSocketServer };
