import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
  limit,
  increment
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { useSocket } from './useSocket';
import { showMessageNotification, playNotificationSound } from '../utils/notifications';

/**
 * Custom hook for chat functionality
 * Combines Socket.io real-time messaging with Firestore persistence
 */
export const useChat = (conversationId) => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const previousMessageCount = useRef(0);

  // Load messages from Firestore
  useEffect(() => {
    if (!conversationId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    // Real-time listener for messages
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        }))
        .filter((msg, index, self) => {
          // Remove duplicates based on ID
          return index === self.findIndex(m => m.id === msg.id);
        })
        .filter(msg => {
          // Filter out invalid/spam messages
          return msg.content && 
                 msg.content.trim().length > 0 && 
                 msg.senderId && 
                 msg.receiverId;
        })
        .sort((a, b) => {
          // Ensure chronological order
          const timeA = a.timestamp?.getTime() || 0;
          const timeB = b.timestamp?.getTime() || 0;
          return timeA - timeB;
        });

      // Check for new messages and show notification
      const currentUser = auth.currentUser;
      if (currentUser && loadedMessages.length > previousMessageCount.current) {
        const newMessages = loadedMessages.slice(previousMessageCount.current);
        newMessages.forEach(msg => {
          if (msg.senderId !== currentUser.uid) {
            // Show notification for messages from others
            showMessageNotification('New Message', msg.content, conversationId);
            playNotificationSound();
          }
        });
      }
      previousMessageCount.current = loadedMessages.length;

      setMessages(loadedMessages);
      setLoading(false);
    }, (error) => {
      console.error('Error loading messages:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join conversation room
    socket.emit('conversation:join', conversationId);
    console.log('📨 Joined conversation:', conversationId);

    // Listen for new messages (real-time via socket)
    const handleNewMessage = (message) => {
      console.log('📩 New message via socket:', message);
      // Message will also be synced via Firestore listener
      // This gives instant feedback before Firestore update
    };

    // Listen for typing indicators
    const handleTypingStart = ({ userId, username }) => {
      console.log('⌨️ User typing:', username);
      setTypingUsers(prev => new Set(prev).add(userId));
    };

    const handleTypingStop = ({ userId }) => {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    };

    // Listen for read receipts
    const handleMessageRead = ({ messageIds, userId }) => {
      console.log('✓✓ Messages read by:', userId, messageIds);
      // Update local state to show read status
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) 
          ? { ...msg, readBy: [...(msg.readBy || []), userId] }
          : msg
      ));
    };

    // Listen for presence updates
    const handlePresenceUpdate = ({ userId, status }) => {
      console.log('👤 Presence update:', userId, status);
      if (status === 'online') {
        setOnlineUsers(prev => new Set(prev).add(userId));
      } else {
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('message:read', handleMessageRead);
    socket.on('presence:update', handlePresenceUpdate);

    // Cleanup
    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('message:read', handleMessageRead);
      socket.off('presence:update', handlePresenceUpdate);
      socket.emit('conversation:leave', conversationId);
    };
  }, [socket, conversationId]);

  // Send message
  const sendMessage = useCallback(async (content, receiverId) => {
    if (!socket || !conversationId || !content.trim()) {
      console.warn('Cannot send message: missing socket, conversationId, or content');
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      console.error('No authenticated user');
      return null;
    }

    // Validate message content
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0 || trimmedContent.length > 5000) {
      console.warn('Invalid message length');
      return null;
    }

    try {
      const messageData = {
        conversationId,
        receiverId,
        content: trimmedContent,
        timestamp: new Date().toISOString()
      };

      // Send via Socket.io for instant delivery
      socket.emit('message:send', messageData);

      // Also save to Firestore for persistence
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const docRef = await addDoc(messagesRef, {
        senderId: user.uid,
        receiverId,
        content: trimmedContent,
        timestamp: serverTimestamp(),
        readBy: [user.uid], // Sender has "read" their own message
        conversationId
      });

      // Update conversation metadata for conversation list
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: content.trim(),
        lastMessageTime: serverTimestamp(),
        [`unreadCount.${receiverId}`]: increment(1)
      });

      console.log('✅ Message sent:', docRef.id);
      return docRef.id;

    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }, [socket, conversationId]);

  // Start typing indicator
  const startTyping = useCallback(() => {
    if (socket && conversationId) {
      socket.emit('typing:start', { conversationId });
    }
  }, [socket, conversationId]);

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (socket && conversationId) {
      socket.emit('typing:stop', { conversationId });
    }
  }, [socket, conversationId]);

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds) => {
    if (!socket || !conversationId || !messageIds.length) return;

    const user = auth.currentUser;
    if (!user) return;

    try {
      // Update via Socket.io for instant read receipts
      socket.emit('message:read', {
        conversationId,
        messageIds
      });

      // Update Firestore for persistence
      const updatePromises = messageIds.map(async (messageId) => {
        const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
        await updateDoc(messageRef, {
          readBy: [...new Set([...(messages.find(m => m.id === messageId)?.readBy || []), user.uid])]
        });
      });

      await Promise.all(updatePromises);
      
      // Reset unread count in conversation
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${user.uid}`]: 0
      });
      
      console.log('✅ Messages marked as read:', messageIds);

    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [socket, conversationId, messages]);

  // Get conversation participants
  const getConversationParticipants = useCallback(async (conversationId) => {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDocs(conversationRef);
      
      if (conversationDoc.exists()) {
        return conversationDoc.data().participants || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting conversation participants:', error);
      return [];
    }
  }, []);

  return {
    messages,
    loading,
    typingUsers: Array.from(typingUsers),
    onlineUsers: Array.from(onlineUsers),
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    getConversationParticipants
  };
};
