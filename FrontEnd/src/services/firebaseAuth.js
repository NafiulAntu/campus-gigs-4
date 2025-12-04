// Firebase Authentication Service
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
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
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || getErrorMessage(error.code) || error.message);
  }
};

/**
 * Verify email exists by attempting to get sign-in methods
 */
const verifyEmailExists = async (email) => {
  try {
    // Firebase will return sign-in methods if email exists
    const { fetchSignInMethodsForEmail } = await import('firebase/auth');
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    // If email doesn't exist in Firebase, it's a new account - that's OK
    return true;
  }
};

/**
 * Sign up with Email and Password
 */
export const signUpWithEmail = async (email, password, username, profession) => {
  try {
    // Validate email format
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      throw new Error('Only Gmail addresses are allowed');
    }
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send email verification to confirm email exists
    try {
      await sendEmailVerification(userCredential.user);
      console.log('✅ Verification email sent to:', email);
    } catch (verifyError) {
      console.warn('⚠️ Could not send verification email:', verifyError.message);
    }
    
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
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || getErrorMessage(error.code) || error.message);
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
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || getErrorMessage(error.code) || error.message);
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
    console.error('Error details:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || getErrorMessage(error.code) || error.message);
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
 * Get current user's ID token (refreshes automatically if expired)
 */
export const getCurrentToken = async () => {
  const user = auth.currentUser;
  if (user) {
    // Force refresh if token is about to expire (within 5 minutes)
    return await user.getIdToken(true);
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
  console.log('Firebase error code:', errorCode); // Debug log
  
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered',
    'auth/invalid-email': 'Invalid email address',
    'auth/operation-not-allowed': 'Operation not allowed',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/user-disabled': 'This account has been disabled',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
    'auth/too-many-requests': 'Too many attempts. Please try again later',
    'auth/popup-closed-by-user': 'Sign in cancelled',
    'auth/cancelled-popup-request': 'Sign in cancelled',
    'auth/account-exists-with-different-credential': 'Account exists with different sign-in method',
    'auth/network-request-failed': 'Network error. Please check your internet connection',
    'auth/internal-error': 'Authentication service error. Please try again',
    'auth/missing-password': 'Please enter your password',
    'auth/invalid-login-credentials': 'Invalid email or password. Please try again.'
  };
  
  return errorMessages[errorCode] || `Authentication error (${errorCode}). Please try again`;
};
