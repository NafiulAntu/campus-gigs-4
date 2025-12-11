const admin = require('firebase-admin');

// Initialize Firebase Admin
// Required for both Authentication and Storage features
// Service account credentials should be in .env file

let bucket;
let isStorageEnabled = false;

try {
  // Check if Firebase credentials are available
  const hasCredentials = process.env.FIREBASE_PROJECT_ID && 
                        process.env.FIREBASE_CLIENT_EMAIL && 
                        process.env.FIREBASE_PRIVATE_KEY;

  if (!hasCredentials) {
    // Initialize with minimal config for Authentication only (using Firebase client SDK)
    // Admin SDK not required if only using client-side Firebase Auth
    console.log('⚠️  Firebase Admin credentials not found - Authentication will use client SDK');
    console.log('⚠️  Firebase Storage disabled - using local storage');
  } else {
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

    // Try to initialize storage bucket if credentials provided
    if (process.env.FIREBASE_STORAGE_BUCKET) {
      try {
        bucket = admin.storage().bucket();
        // Don't set isStorageEnabled to true yet - will be tested on first upload
        console.log('✅ Firebase Admin SDK initialized (Auth + Storage bucket configured)');
        console.log('⚠️  Using local storage for verification uploads');
      } catch (bucketError) {
        console.log('⚠️  Firebase Storage bucket not accessible - using local storage');
      }
    } else {
      console.log('✅ Firebase Admin SDK initialized (Auth only)');
    }
  }
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
  // For verification uploads, always use local storage
  // Firebase bucket is not available yet
  if (fileName.includes('verifications/')) {
    return await uploadToLocalStorage(fileBuffer, fileName, mimeType);
  }

  // If Firebase Storage is not available, use local storage
  if (!bucket || !isStorageEnabled) {
    return await uploadToLocalStorage(fileBuffer, fileName, mimeType);
  }

  try {
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
  } catch (error) {
    console.error('⚠️  Firebase upload failed, using local storage:', error.message);
    return await uploadToLocalStorage(fileBuffer, fileName, mimeType);
  }
}

/**
 * Upload file to local storage (fallback)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - File name with path
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} - Public URL of uploaded file
 */
async function uploadToLocalStorage(fileBuffer, fileName, mimeType) {
  const fs = require('fs').promises;
  const path = require('path');
  
  // Create uploads directory structure
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'verifications');
  await fs.mkdir(uploadsDir, { recursive: true });
  
  // Generate unique filename
  const uniqueFileName = `${Date.now()}_${fileName.replace(/\//g, '_')}`;
  const filePath = path.join(uploadsDir, uniqueFileName);
  
  // Save file
  await fs.writeFile(filePath, fileBuffer);
  
  // Return local URL (accessible via static route)
  const publicUrl = `http://localhost:5000/uploads/verifications/${uniqueFileName}`;
  console.log('✅ File saved to local storage:', publicUrl);
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
  admin, // Export admin instance for token verification
};
