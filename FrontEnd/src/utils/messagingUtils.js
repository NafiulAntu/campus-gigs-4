import { 
  collection, 
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Messaging utilities for creating and managing conversations
 */

/**
 * Get or create a conversation between two users
 * @param {string} currentUserId - Current user's ID
 * @param {string} otherUserId - Other user's ID
 * @param {string} otherUserName - Other user's name (for display)
 * @param {string} otherUserPhoto - Other user's photo URL
 * @returns {Promise<string>} - Conversation ID
 */
export async function getOrCreateConversation(
  currentUserId, 
  otherUserId, 
  otherUserName = 'User',
  otherUserPhoto = null
) {
  try {
    // Create consistent conversation ID (sorted user IDs)
    const conversationId = [currentUserId, otherUserId]
      .sort()
      .join('_');

    // Check if conversation already exists
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);

    if (!conversationDoc.exists()) {
      // Create new conversation
      await setDoc(conversationRef, {
        conversationId,
        participants: [currentUserId, otherUserId],
        participantInfo: {
          [currentUserId]: {
            userId: currentUserId,
            lastRead: serverTimestamp()
          },
          [otherUserId]: {
            userId: otherUserId,
            name: otherUserName,
            photo: otherUserPhoto,
            lastRead: serverTimestamp()
          }
        },
        lastMessageTime: serverTimestamp(),
        lastMessage: '',
        createdAt: serverTimestamp(),
        unreadCount: {
          [currentUserId]: 0,
          [otherUserId]: 0
        }
      });

      console.log('✅ Created new conversation:', conversationId);
    } else {
      console.log('📨 Conversation already exists:', conversationId);
    }

    return conversationId;

  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

/**
 * Get all conversations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of conversations
 */
export async function getUserConversations(userId) {
  try {
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId)
    );

    const snapshot = await getDocs(q);
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      conversationId: doc.id,
      ...doc.data(),
      // Calculate other participant info
      otherParticipant: doc.data().participants.find(p => p !== userId)
    }));

    // Sort by last message time
    conversations.sort((a, b) => {
      const timeA = a.lastMessageTime?.toMillis() || 0;
      const timeB = b.lastMessageTime?.toMillis() || 0;
      return timeB - timeA;
    });

    return conversations;

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

/**
 * Update conversation's last message
 * @param {string} conversationId - Conversation ID
 * @param {string} lastMessage - Last message text
 * @returns {Promise<void>}
 */
export async function updateLastMessage(conversationId, lastMessage) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await setDoc(conversationRef, {
      lastMessage,
      lastMessageTime: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating last message:', error);
  }
}

/**
 * Increment unread count for a user in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID to increment count for
 * @returns {Promise<void>}
 */
export async function incrementUnreadCount(conversationId, userId) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (conversationDoc.exists()) {
      const data = conversationDoc.data();
      const currentCount = data.unreadCount?.[userId] || 0;
      
      await setDoc(conversationRef, {
        unreadCount: {
          ...data.unreadCount,
          [userId]: currentCount + 1
        }
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error incrementing unread count:', error);
  }
}

/**
 * Reset unread count for a user in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID to reset count for
 * @returns {Promise<void>}
 */
export async function resetUnreadCount(conversationId, userId) {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    
    if (conversationDoc.exists()) {
      const data = conversationDoc.data();
      
      await setDoc(conversationRef, {
        unreadCount: {
          ...data.unreadCount,
          [userId]: 0
        }
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error resetting unread count:', error);
  }
}

/**
 * Delete a conversation (for the current user only)
 * In a production app, you might want to just hide it instead of deleting
 * @param {string} conversationId - Conversation ID
 * @param {string} userId - User ID who is deleting
 * @returns {Promise<void>}
 */
export async function deleteConversation(conversationId, userId) {
  try {
    // In production, mark as deleted for this user only
    const conversationRef = doc(db, 'conversations', conversationId);
    await setDoc(conversationRef, {
      deletedBy: {
        [userId]: serverTimestamp()
      }
    }, { merge: true });

    console.log('🗑️ Conversation marked as deleted for user:', userId);
  } catch (error) {
    console.error('Error deleting conversation:', error);
  }
}

/**
 * Get unread message count for a user across all conversations
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Total unread count
 */
export async function getTotalUnreadCount(userId) {
  try {
    const conversations = await getUserConversations(userId);
    const total = conversations.reduce((sum, conv) => {
      return sum + (conv.unreadCount?.[userId] || 0);
    }, 0);
    
    return total;
  } catch (error) {
    console.error('Error getting total unread count:', error);
    return 0;
  }
}
