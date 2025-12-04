import { 
  collection, 
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Messaging utilities for creating and managing conversations
 */

/**
 * Test Firestore connection
 */
export async function testFirestoreConnection() {
  try {
    const testRef = doc(db, '_test_', 'connection');
    await getDoc(testRef);
    console.log('✅ Firestore connection test passed');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    return false;
  }
}

/**
 * Get or create a conversation between two users
 * @param {string} currentUserId - Current user's ID
 * @param {string} otherUserId - Other user's ID
 * @param {string} otherUserName - Other user's name (for display)
 * @param {string} otherUserPhoto - Other user's photo URL
 * @param {string} currentUserName - Current user's name (for display)
 * @param {string} currentUserPhoto - Current user's photo URL
 * @returns {Promise<string>} - Conversation ID
 */
export async function getOrCreateConversation(
  currentUserId, 
  otherUserId, 
  otherUserName = 'User',
  otherUserPhoto = null,
  currentUserName = 'User',
  currentUserPhoto = null
) {
  try {
    // Validate inputs
    if (!currentUserId || !otherUserId) {
      throw new Error('Both user IDs are required to create a conversation');
    }

    if (currentUserId === otherUserId) {
      throw new Error('Cannot create conversation with yourself');
    }

    // Create consistent conversation ID (sorted user IDs)
    const conversationId = [currentUserId, otherUserId]
      .sort()
      .join('_');

    console.log('🔍 Checking for conversation:', conversationId);

    // First check if any conversation exists between these users (could have different ID format)
    const conversationsRef = collection(db, 'conversations');
    const q1 = query(
      conversationsRef,
      where('participants', 'array-contains', currentUserId)
    );

    const snapshot = await getDocs(q1);
    const existingConv = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.participants?.includes(otherUserId);
    });

    if (existingConv) {
      console.log('✅ Found existing conversation:', existingConv.id);
      return existingConv.id;
    }

    // Use transaction to prevent race conditions
    console.log('📝 Creating new conversation with transaction');
    const conversationRef = doc(db, 'conversations', conversationId);
    
    await runTransaction(db, async (transaction) => {
      const conversationDoc = await transaction.get(conversationRef);
      
      if (conversationDoc.exists()) {
        console.log('✅ Conversation exists (found in transaction)');
        return;
      }

      // Create new conversation
      transaction.set(conversationRef, {
        conversationId,
        participants: [currentUserId, otherUserId],
        participantInfo: {
          [currentUserId]: {
            userId: currentUserId,
            name: currentUserName,
            photo: currentUserPhoto,
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
      
      console.log('✅ New conversation created in transaction');
    });

    return conversationId;

  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error object:', error);
    
    // Provide more specific error information
    if (error.code === 'permission-denied') {
      const permissionError = new Error('Firestore permission denied. Please ensure:\n1. Firestore security rules allow conversation creation\n2. User is authenticated with Firebase');
      permissionError.code = 'permission-denied';
      throw permissionError;
    } else if (error.code === 'unavailable') {
      const unavailableError = new Error('Firestore database is unavailable. This could mean:\n1. Firestore is not enabled in Firebase Console\n2. Internet connection issue\n3. Firebase project configuration issue');
      unavailableError.code = 'unavailable';
      throw unavailableError;
    }
    
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

/**
 * Diagnose messaging issues for a user
 * @param {object} user - User object
 * @returns {Promise<object>} - Diagnosis result with canSendMessages, issues, and solutions
 */
export async function diagnoseMessagingIssue(user) {
  const issues = [];
  const solutions = [];

  // Check if user has firebase_uid
  if (!user || !user.firebase_uid) {
    issues.push('User does not have Firebase UID');
    solutions.push('User needs to log in with Firebase authentication');
    return { canSendMessages: false, issues, solutions };
  }

  // Check Firestore connection
  try {
    const isConnected = await testFirestoreConnection();
    if (!isConnected) {
      issues.push('Cannot connect to Firestore');
      solutions.push('Check Firebase configuration and internet connection');
      return { canSendMessages: false, issues, solutions };
    }
  } catch (error) {
    issues.push('Firestore connection error: ' + error.message);
    solutions.push('Verify Firebase is properly initialized');
    return { canSendMessages: false, issues, solutions };
  }

  return { canSendMessages: true, issues: [], solutions: [] };
}
