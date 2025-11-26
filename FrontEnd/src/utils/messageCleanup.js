import { db } from '../config/firebase';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';

/**
 * Clean duplicate messages in a conversation
 * Keeps the first occurrence of each message based on content and timestamp
 */
export const cleanDuplicateMessages = async (conversationId) => {
  try {
    console.log(`🧹 Cleaning duplicates in conversation: ${conversationId}`);
    
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    
    const messages = [];
    const duplicates = [];
    const seenMessages = new Map();
    
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const key = `${data.senderId}-${data.content}-${data.timestamp?.seconds}`;
      
      if (seenMessages.has(key)) {
        // This is a duplicate
        duplicates.push({
          id: docSnap.id,
          content: data.content,
          timestamp: data.timestamp
        });
      } else {
        seenMessages.set(key, docSnap.id);
        messages.push({
          id: docSnap.id,
          ...data
        });
      }
    });
    
    // Delete duplicates
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} duplicate messages`);
      
      for (const dup of duplicates) {
        const docRef = doc(db, 'conversations', conversationId, 'messages', dup.id);
        await deleteDoc(docRef);
        console.log(`Deleted duplicate: ${dup.id}`);
      }
      
      console.log(`✅ Cleaned ${duplicates.length} duplicate messages`);
      return { success: true, deleted: duplicates.length };
    } else {
      console.log('✅ No duplicates found');
      return { success: true, deleted: 0 };
    }
    
  } catch (error) {
    console.error('Error cleaning duplicates:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clean all spam/test messages from a conversation
 * Removes messages that look like test data (e.g., "sdfasdf", "test", etc.)
 */
export const cleanSpamMessages = async (conversationId) => {
  try {
    console.log(`🧹 Cleaning spam messages in conversation: ${conversationId}`);
    
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const snapshot = await getDocs(messagesRef);
    
    const spamPatterns = [
      /^s[df]{2,}a[sdf]{2,}$/i,  // Matches "sdfasdf", "sdasdf", etc.
      /^[|]{3,}[a-z]{2,}[d]{3,}$/i, // Matches "|||lkasjdddd"
      /^test\s*\d*$/i,             // Matches "test", "test1", etc.
      /^[a-z]{1}\1{3,}$/i,         // Matches repeated chars like "aaaa"
      /^[sdf]{4,}$/i               // Matches "sdfdf", "sssss", etc.
    ];
    
    const spamMessages = [];
    
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const content = data.content?.trim() || '';
      
      // Check if message matches spam patterns
      const isSpam = spamPatterns.some(pattern => pattern.test(content));
      
      if (isSpam) {
        spamMessages.push({
          id: docSnap.id,
          content: content
        });
      }
    });
    
    // Delete spam messages
    if (spamMessages.length > 0) {
      console.log(`Found ${spamMessages.length} spam messages`);
      
      for (const spam of spamMessages) {
        const docRef = doc(db, 'conversations', conversationId, 'messages', spam.id);
        await deleteDoc(docRef);
        console.log(`Deleted spam: ${spam.content}`);
      }
      
      console.log(`✅ Cleaned ${spamMessages.length} spam messages`);
      return { success: true, deleted: spamMessages.length };
    } else {
      console.log('✅ No spam messages found');
      return { success: true, deleted: 0 };
    }
    
  } catch (error) {
    console.error('Error cleaning spam:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Full cleanup: removes both duplicates and spam
 */
export const cleanupConversation = async (conversationId) => {
  try {
    console.log(`🧹 Full cleanup for conversation: ${conversationId}`);
    
    const spamResult = await cleanSpamMessages(conversationId);
    const dupResult = await cleanDuplicateMessages(conversationId);
    
    const totalDeleted = (spamResult.deleted || 0) + (dupResult.deleted || 0);
    
    return {
      success: true,
      deletedSpam: spamResult.deleted || 0,
      deletedDuplicates: dupResult.deleted || 0,
      totalDeleted
    };
    
  } catch (error) {
    console.error('Error in full cleanup:', error);
    return { success: false, error: error.message };
  }
};
