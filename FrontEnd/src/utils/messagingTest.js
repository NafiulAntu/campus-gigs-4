import { auth } from '../config/firebase';
import { getUserById } from '../services/api';

/**
 * Quick messaging compatibility checker
 * Run this in the browser console to test if two users can message each other
 */

window.testMessaging = async (targetUserId) => {
  console.log('🔍 Testing messaging compatibility...\n');
  
  // Check current user
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.error('❌ You are not logged in with Firebase');
    console.log('💡 Solution: Log in using Google, GitHub, or Firebase Email/Password');
    return false;
  }
  
  console.log('✅ Current user Firebase UID:', currentUser.uid);
  console.log('📧 Current user email:', currentUser.email);
  
  // Check target user
  try {
    const response = await getUserById(targetUserId);
    const targetUser = response.data;
    
    console.log('\n📝 Target user info:');
    console.log('  - Name:', targetUser.full_name);
    console.log('  - Email:', targetUser.email);
    console.log('  - Firebase UID:', targetUser.firebase_uid || '❌ MISSING');
    
    if (!targetUser.firebase_uid) {
      console.error('\n❌ MESSAGING WILL NOT WORK');
      console.log('💡 Reason: Target user does not have a Firebase UID');
      console.log('💡 Solution: Target user needs to log in using Firebase authentication');
      return false;
    }
    
    console.log('\n✅ MESSAGING SHOULD WORK!');
    console.log('Conversation ID would be:', [currentUser.uid, targetUser.firebase_uid].sort().join('_'));
    return true;
    
  } catch (error) {
    console.error('❌ Error fetching target user:', error);
    return false;
  }
};

// Usage instructions
console.log('💬 Messaging Test Utility Loaded!');
console.log('To test if you can message a user, run:');
console.log('testMessaging(USER_ID)');
console.log('Example: testMessaging(123)');
