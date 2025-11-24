// Firebase Authentication Service
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { syncUserWithBackend } from './api';

// Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// GitHub Provider
const githubProvider = new GithubAuthProvider();

/**
 * Sign in with Email and Password
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    
    // Sync with backend
    const backendUser = await syncUserWithBackend(idToken, {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
      photoURL: userCredential.user.photoURL
    });
    
    return {
      user: userCredential.user,
      token: idToken,
      backendUser
    };
  } catch (error) {
    console.error('Sign in error:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

/**
 * Sign up with Email and Password
 */
export const signUpWithEmail = async (email, password, username, profession) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update profile with username
    await updateProfile(userCredential.user, {
      displayName: username
    });
    
    const idToken = await userCredential.user.getIdToken();
    
    // Sync with backend
    const backendUser = await syncUserWithBackend(idToken, {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: username,
      profession: profession
    });
    
    return {
      user: userCredential.user,
      token: idToken,
      backendUser
    };
  } catch (error) {
    console.error('Sign up error:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    // Sync with backend
    const backendUser = await syncUserWithBackend(idToken, {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      provider: 'google'
    });
    
    return {
      user: result.user,
      token: idToken,
      backendUser
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

/**
 * Sign in with GitHub
 */
export const signInWithGitHub = async () => {
  try {
    const result = await signInWithPopup(auth, githubProvider);
    const idToken = await result.user.getIdToken();
    
    // Sync with backend
    const backendUser = await syncUserWithBackend(idToken, {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      provider: 'github'
    });
    
    return {
      user: result.user,
      token: idToken,
      backendUser
    };
  } catch (error) {
    console.error('GitHub sign in error:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

/**
 * Sign out
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Password reset error:', error);
    throw new Error(getErrorMessage(error.code));
  }
};

/**
 * Get current user's ID token
 */
export const getCurrentToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

/**
 * Listen to auth state changes
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get user-friendly error messages
 */
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/popup-closed-by-user': 'Sign in cancelled',
    'auth/cancelled-popup-request': 'Sign in cancelled',
    'auth/account-exists-with-different-credential': 'Account exists with different sign-in method'
  };
  
  return errorMessages[errorCode] || 'An error occurred. Please try again';
};
