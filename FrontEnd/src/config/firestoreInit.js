import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Initialize and verify Firestore connection
 */
export const initializeFirestore = async () => {
  try {
    console.log('🔥 Initializing Firestore connection...');
    
    // Try to read from a test collection
    const testRef = doc(db, '_health_', 'check');
    await getDoc(testRef);
    
    console.log('✅ Firestore is connected and accessible');
    return { success: true, message: 'Firestore connected' };
    
  } catch (error) {
    console.error('❌ Firestore initialization failed:', error);
    
    if (error.code === 'permission-denied') {
      console.error('⛔ Firestore security rules are blocking access');
      console.error('📋 Solution: Update Firestore security rules in Firebase Console');
      return { 
        success: false, 
        error: 'permission-denied',
        message: 'Firestore security rules need to be updated. See console for details.'
      };
    }
    
    if (error.code === 'unavailable') {
      console.error('🔴 Firestore database is not available');
      console.error('📋 Solution: Enable Firestore in Firebase Console');
      return { 
        success: false, 
        error: 'unavailable',
        message: 'Firestore database needs to be created in Firebase Console.'
      };
    }
    
    return { 
      success: false, 
      error: error.code,
      message: error.message 
    };
  }
};

// Auto-initialize on import (only in browser)
if (typeof window !== 'undefined') {
  initializeFirestore().then(result => {
    if (!result.success) {
      console.warn('⚠️  Firestore features (messaging) may not work:', result.message);
    }
  });
}
