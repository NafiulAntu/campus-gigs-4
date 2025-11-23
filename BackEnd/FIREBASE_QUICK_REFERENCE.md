# Firebase Storage Integration - Quick Reference

## 🎯 What Changed?

### Before

```
User uploads file
    ↓
Frontend → Backend (Multer)
    ↓
Saved to: BackEnd/uploads/posts/
    ↓
URL: http://localhost:5000/uploads/posts/filename.jpg
```

### After

```
User uploads file
    ↓
Frontend → Backend (Multer + Firebase)
    ↓
Saved to: Firebase Storage (posts/)
    ↓
URL: https://storage.googleapis.com/your-bucket/posts/filename.jpg
```

## 📁 New Files

```
BackEnd/
├── config/
│   └── firebase.js                         [NEW] - Firebase Storage service
├── FIREBASE_SETUP.md                       [NEW] - Setup instructions
├── FIREBASE_INTEGRATION_SUMMARY.md         [NEW] - Implementation details
└── .env                                    [UPDATED] - Firebase credentials
```

## 🔧 Modified Files

### 1. `BackEnd/routes/uploadRoutes.js`

```javascript
// Before: Disk storage
const storage = multer.diskStorage({ ... });

// After: Memory storage → Firebase
const storage = multer.memoryStorage();
const firebaseUrl = await uploadToFirebase(file.buffer, ...);
```

### 2. `BackEnd/controllers/postController.js`

```javascript
// New: Delete from Firebase when post is deleted
const { deleteFromFirebase } = require("../config/firebase");

exports.deletePost = async (req, res) => {
  // Get post media URLs
  const post = await Post.getById(postId);

  // Delete from database
  await Post.delete(postId, userId);

  // Delete from Firebase Storage
  for (const url of post.media_urls) {
    await deleteFromFirebase(url);
  }
};
```

### 3. `BackEnd/.env`

```env
# Added Firebase credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email
FIREBASE_PRIVATE_KEY="your-key"
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
```

## ⚙️ How It Works

### File Upload Flow

```
1. User selects file in PostComposer
2. Frontend: FormData with files
3. Backend: Multer receives files in memory
4. Backend: Upload to Firebase Storage
5. Firebase: Returns public URL
6. Backend: Save URL to PostgreSQL (media_urls)
7. Frontend: Display image from Firebase URL
```

### File Delete Flow

```
1. User clicks delete button
2. Frontend: Confirmation modal
3. Backend: Get post with media_urls
4. Backend: Delete from PostgreSQL
5. Backend: Delete from Firebase Storage
6. Frontend: Remove post from UI
```

## 🔥 Firebase Functions

### Upload

```javascript
const { uploadToFirebase } = require("../config/firebase");

const url = await uploadToFirebase(
  fileBuffer, // File data
  fileName, // Original filename
  mimeType // Content type
);
```

### Delete

```javascript
const { deleteFromFirebase } = require("../config/firebase");

await deleteFromFirebase(
  "https://storage.googleapis.com/bucket/posts/file.jpg"
);
```

### Check Status

```javascript
const { isFirebaseEnabled } = require("../config/firebase");

if (isFirebaseEnabled()) {
  // Use Firebase
} else {
  // Use local storage
}
```

## 📊 Storage Comparison

| Feature         | Local Storage | Firebase Storage |
| --------------- | ------------- | ---------------- |
| File Size Limit | 10MB          | 50MB             |
| Scalability     | Limited       | Unlimited        |
| CDN             | ❌ No         | ✅ Yes           |
| Backup          | Manual        | Automatic        |
| Cost            | Server disk   | $0.026/GB        |
| Speed           | Server speed  | CDN speed        |
| Video Support   | ❌ No         | ✅ Yes           |

## 🚦 Status Indicators

### Console Messages

#### Firebase Enabled

```
✅ Firebase Storage initialized
🔥 Using Firebase Storage
  ✅ image.jpg → Firebase
📤 Uploading 2 file(s)...
```

#### Firebase Not Configured

```
⚠️  Using local storage as fallback
💾 Using local storage (Firebase not configured)
  ✅ image.jpg → Local
```

#### Firebase Error

```
❌ Firebase initialization error: [error message]
⚠️  Using local storage as fallback
```

## 🧪 Testing Checklist

### Upload Test

- [ ] Create post with image
- [ ] Check console for Firebase message
- [ ] Verify URL starts with `https://storage.googleapis.com/`
- [ ] Image displays correctly
- [ ] Check Firebase Console for file

### Video Upload Test

- [ ] Upload MP4 video
- [ ] Video plays correctly
- [ ] Check file size (up to 50MB)

### Delete Test

- [ ] Delete post with media
- [ ] Check console: `🗑️ Deleting media files...`
- [ ] Verify file removed from Firebase Console
- [ ] Post removed from feed

### Fallback Test

- [ ] Remove Firebase credentials from `.env`
- [ ] Restart server
- [ ] Upload file
- [ ] Check console: `💾 Using local storage`
- [ ] File saved to `BackEnd/uploads/posts/`

## 🔐 Security Checklist

- [ ] Firebase credentials in `.env`
- [ ] `.env` added to `.gitignore`
- [ ] Firebase JSON not committed
- [ ] Storage Rules configured (read: public, write: false)
- [ ] File type validation enabled
- [ ] File size limits enforced

## 📋 Deployment Checklist

### Before Deploy

- [ ] Firebase project created
- [ ] Storage enabled
- [ ] Rules configured
- [ ] Service account generated
- [ ] Credentials added to `.env`

### During Deploy

- [ ] Set environment variables on hosting platform
- [ ] Don't upload `.env` file
- [ ] Test file upload
- [ ] Monitor Firebase quota
- [ ] Check error logs

### After Deploy

- [ ] Test image upload
- [ ] Test video upload
- [ ] Verify Firebase URLs work
- [ ] Check delete functionality
- [ ] Monitor Firebase usage

## 💡 Tips & Tricks

### Get Firebase Project ID

```bash
# From Firebase Console URL:
https://console.firebase.google.com/project/YOUR-PROJECT-ID
```

### Check Firebase Quota

```bash
# Firebase Console → Storage → Usage
Storage: X GB / 5 GB
Downloads: X GB / 1 GB per day
```

### Debug Firebase Errors

```javascript
// Add detailed logging in firebase.js
console.log("Firebase config:", {
  projectId: process.env.FIREBASE_PROJECT_ID,
  bucket: process.env.FIREBASE_STORAGE_BUCKET,
});
```

### Clear Local Uploads

```bash
# Remove old local files
rm -rf BackEnd/uploads/posts/*
```

### Test Without Frontend

```bash
# Upload file with curl
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "files=@image.jpg"
```

## 🆘 Common Issues

### Issue: "Firebase Storage not initialized"

**Solution:** Check `.env` for correct Firebase credentials

### Issue: "Invalid PEM formatted message"

**Solution:** Ensure `FIREBASE_PRIVATE_KEY` is wrapped in quotes and includes `\n` characters

### Issue: Files still going to local storage

**Solution:**

1. Verify Firebase credentials
2. Restart server
3. Check console for initialization message

### Issue: "Permission denied" in Firebase

**Solution:** Update Storage Rules to allow read access

### Issue: File size too large

**Solution:** Increase limit in `uploadRoutes.js` or compress file

## 📚 Resources

- **Firebase Console**: https://console.firebase.google.com/
- **Firebase Storage Docs**: https://firebase.google.com/docs/storage
- **Pricing**: https://firebase.google.com/pricing
- **Node.js SDK**: https://firebase.google.com/docs/admin/setup

## ✅ Success Indicators

Your Firebase integration is working correctly if you see:

```bash
# Server Start
✅ Firebase Storage initialized
🚀 Server running on http://localhost:5000

# File Upload
📤 Uploading 1 file(s)...
🔥 Using Firebase Storage
  ✅ image.jpg → Firebase

# File Delete
🗑️ Deleting media files from Firebase Storage...
✅ File deleted from Firebase: posts/123456_image.jpg
```

And your files appear in Firebase Console → Storage → posts/ folder!

---

**Need Help?** Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions.
