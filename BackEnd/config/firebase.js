const admin = require('firebase-admin');

// Initialize Firebase Admin
// You'll need to add your Firebase service account key
// Download it from Firebase Console -> Project Settings -> Service Accounts
// For now, we'll use environment variables

let bucket;

try {
  // Initialize Firebase Admin with service account
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }

  bucket = admin.storage().bucket();
  console.log('✅ Firebase Storage initialized');
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.log('⚠️  Using local storage as fallback');
}

/**
 * Upload file to Firebase Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name with path
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToFirebase(fileBuffer, fileName, mimeType) {
  if (!bucket) {
    throw new Error('Firebase Storage not initialized');
  }

  const file = bucket.file(`posts/${Date.now()}_${fileName}`);
  
  await file.save(fileBuffer, {
    metadata: {
      contentType: mimeType,
    },
    public: true,
  });

  // Get public URL
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
  return publicUrl;
}

/**
 * Delete file from Firebase Storage
 * @param {string} fileUrl - Full URL of the file
 * @returns {Promise<void>}
 */
async function deleteFromFirebase(fileUrl) {
  if (!bucket || !fileUrl) return;

  try {
    // Extract file path from URL
    const fileName = fileUrl.split(`${bucket.name}/`)[1];
    if (fileName) {
      await bucket.file(fileName).delete();
      console.log('✅ File deleted from Firebase:', fileName);
    }
  } catch (error) {
    console.error('Error deleting from Firebase:', error.message);
  }
}

module.exports = {
  uploadToFirebase,
  deleteFromFirebase,
  isFirebaseEnabled: () => !!bucket,
};
