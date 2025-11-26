import { auth } from '../config/firebase';
import { syncUserWithBackend } from '../services/api';

/**
 * Link existing local account with Firebase authentication
 * This allows users who signed up with backend auth to use Firebase features like messaging
 */
export const linkLocalAccountWithFirebase = async () => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('No Firebase user is currently logged in');
    }

    // Get Firebase token
    const firebaseToken = await currentUser.getIdToken();
    
    // Sync with backend - this will update the firebase_uid in the database
    const backendUser = await syncUserWithBackend(firebaseToken, {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL
    });

    console.log('✅ Account linked successfully:', backendUser);
    return backendUser;
    
  } catch (error) {
    console.error('❌ Error linking account:', error);
    throw error;
  }
};

/**
 * Check if the current user has Firebase authentication enabled
 */
export const checkFirebaseAuth = async () => {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return {
      isFirebaseUser: false,
      message: 'Not logged in with Firebase'
    };
  }

  return {
    isFirebaseUser: true,
    uid: currentUser.uid,
    email: currentUser.email,
    displayName: currentUser.displayName,
    emailVerified: currentUser.emailVerified
  };
};

/**
 * Diagnose messaging capability
 */
export const diagnoseMessagingIssue = async (targetUser) => {
  const diagnosis = {
    canSendMessages: false,
    issues: [],
    solutions: []
  };

  // Check current user
  const currentFirebaseUser = auth.currentUser;
  if (!currentFirebaseUser) {
    diagnosis.issues.push('You are not logged in with Firebase authentication');
    diagnosis.solutions.push('Log in using Firebase (Google, GitHub, or Firebase Email/Password)');
    return diagnosis;
  }

  // Check target user
  if (!targetUser.firebase_uid) {
    diagnosis.issues.push('The target user is not registered with Firebase authentication');
    diagnosis.solutions.push('The other user needs to log in using Firebase authentication to receive messages');
    return diagnosis;
  }

  diagnosis.canSendMessages = true;
  return diagnosis;
};
