// Firebase Web Configuration
// This is for frontend features like Authentication, Firestore, etc.

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAe83aJu2CASg4Cdm4EY3kXbKBN_PvoDs",
  authDomain: "campus-gigs-33f61.firebaseapp.com",
  projectId: "campus-gigs-33f61",
  storageBucket: "campus-gigs-33f61.firebasestorage.app",
  messagingSenderId: "876700840000",
  appId: "1:876700840000:web:f3c511addc8cdd700d2fa5",
  measurementId: "G-HV08HG640X"
};

// VAPID Key for Push Notifications
// Get this from: Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
// Note: This is a placeholder. FCM notifications will not work until you add a valid VAPID key.
export const VAPID_KEY = null; // Set to null to disable FCM until configured

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };

export default app;
