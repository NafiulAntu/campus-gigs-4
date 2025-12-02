import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Cleanup duplicate conversations in Firestore
 * Keeps only the oldest conversation for each user pair
 */
export async function cleanupDuplicateConversations() {
  try {
    console.log('🧹 Starting duplicate conversation cleanup...');
    
    const conversationsRef = collection(db, 'conversations');
    const snapshot = await getDocs(conversationsRef);
    
    // Group conversations by participant pairs
    const conversationGroups = new Map();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!data.participants || data.participants.length !== 2) {
        console.warn('⚠️ Invalid conversation:', doc.id);
        return;
      }
      
      // Create consistent key for participant pair
      const pairKey = data.participants.sort().join('_');
      
      if (!conversationGroups.has(pairKey)) {
        conversationGroups.set(pairKey, []);
      }
      
      conversationGroups.get(pairKey).push({
        id: doc.id,
        data: data,
        createdAt: data.createdAt?.toMillis() || 0
      });
    });
    
    // Find and remove duplicates
    let duplicatesRemoved = 0;
    
    for (const [pairKey, conversations] of conversationGroups) {
      if (conversations.length > 1) {
        console.log(`🔍 Found ${conversations.length} conversations for pair: ${pairKey}`);
        
        // Sort by creation time (oldest first)
        conversations.sort((a, b) => a.createdAt - b.createdAt);
        
        // Keep the oldest, delete the rest
        const toKeep = conversations[0];
        const toDelete = conversations.slice(1);
        
        console.log(`✅ Keeping conversation: ${toKeep.id} (created: ${new Date(toKeep.createdAt).toISOString()})`);
        
        for (const conv of toDelete) {
          console.log(`🗑️  Deleting duplicate: ${conv.id} (created: ${new Date(conv.createdAt).toISOString()})`);
          await deleteDoc(doc(db, 'conversations', conv.id));
          duplicatesRemoved++;
        }
      }
    }
    
    console.log(`✅ Cleanup complete! Removed ${duplicatesRemoved} duplicate conversations.`);
    return {
      success: true,
      duplicatesRemoved,
      totalGroups: conversationGroups.size
    };
    
  } catch (error) {
    console.error('❌ Error cleaning up conversations:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run this function manually from browser console:
// import { cleanupDuplicateConversations } from './utils/cleanupDuplicateConversations';
// cleanupDuplicateConversations();
