# Firebase Storage Setup Guide

This application now uses Firebase Storage for handling media files (images, videos, documents) while keeping PostgreSQL for post data and metadata.

## Why Firebase Storage?

✅ **Scalability**: Handle large media files without burdening your server
✅ **CDN Delivery**: Fast content delivery globally
✅ **Cost-Effective**: Free tier includes 5GB storage + 1GB/day downloads
✅ **Reliability**: Google's infrastructure for file hosting
✅ **Security**: Built-in access control and authentication

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Enter project name (e.g., "campus-gigs")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firebase Storage

1. In your Firebase project, click **"Storage"** in the left sidebar
2. Click **"Get Started"**
3. Choose **"Start in production mode"**
4. Select a Cloud Storage location (choose closest to your users)
5. Click **"Done"**

### 3. Configure Storage Rules (Important!)

1. In Storage section, click the **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /posts/{allPaths=**} {
      allow read: if true; // Anyone can read
      allow write: if false; // Only backend can write
    }
  }
}
```

3. Click **"Publish"**

### 4. Get Service Account Credentials

1. Click the **⚙️ gear icon** → **"Project settings"**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** - This downloads a JSON file
5. **IMPORTANT**: Keep this file secure! Never commit it to Git!

### 5. Configure Environment Variables

Open `BackEnd/.env` and add your Firebase credentials:

```env
# Firebase Storage Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

**How to fill these values:**

From the downloaded JSON file:

- `FIREBASE_PROJECT_ID` → Copy `project_id`
- `FIREBASE_CLIENT_EMAIL` → Copy `client_email`
- `FIREBASE_PRIVATE_KEY` → Copy `private_key` (keep it in quotes!)
- `FIREBASE_STORAGE_BUCKET` → Copy `project_id` and add `.appspot.com`

**Example:**

```env
FIREBASE_PROJECT_ID=campus-gigs-abc123
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@campus-gigs-abc123.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEF...(very long key)...XYZ\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=campus-gigs-abc123.appspot.com
```

### 6. Restart Your Backend Server

```bash
cd BackEnd
npm start
```

You should see:

```
✅ Firebase Storage initialized
```

## Fallback Mode

If Firebase is not configured, the app will automatically fall back to local storage:

```
⚠️  Using local storage as fallback
💾 Using local storage (Firebase not configured)
```

Your app will still work, but files will be stored on your server.

## Testing

1. **Create a post with an image**

   - Upload should show: `🔥 Using Firebase Storage`
   - URL should start with: `https://storage.googleapis.com/`

2. **Delete a post with media**

   - Console should show: `🗑️ Deleting media files from Firebase Storage...`
   - Files should be removed from Firebase Storage

3. **View Firebase Storage**
   - Go to Firebase Console → Storage
   - You should see files in `posts/` folder

## Supported File Types

### Images

- JPEG, JPG, PNG, GIF, WEBP

### Videos

- MP4, MOV, AVI, WEBM

### Documents

- PDF, DOC, DOCX, TXT, ODT, RTF
- PPT, PPTX, XLS, XLSX, CSV

### Archives

- ZIP, RAR

**File Size Limits:**

- Maximum: 50MB per file
- Up to 10 files per post

## Security Best Practices

✅ **Never commit** `.env` file or Firebase service account JSON
✅ **Add to .gitignore**:

```
.env
*-firebase-adminsdk-*.json
```

✅ **Use environment variables** in production (Heroku, Vercel, etc.)
✅ **Keep Storage Rules** restrictive (read: public, write: backend only)

## Troubleshooting

### Error: "Firebase Storage not initialized"

- Check if `.env` file has correct Firebase credentials
- Ensure `FIREBASE_PRIVATE_KEY` is wrapped in quotes
- Verify service account has Storage Admin permission

### Error: "Permission denied"

- Check Firebase Storage Rules
- Ensure rules allow read access for `/posts/**`

### Files not uploading

- Check Firebase quota (free tier: 5GB storage)
- Verify file size is under 50MB
- Check console for error messages

### Local storage being used instead

- This means Firebase is not configured
- App works fine, but files are stored locally
- Follow setup instructions above to enable Firebase

## Migration to Production

When deploying to production (Heroku, AWS, etc.):

1. **Don't upload** `.env` file
2. **Set environment variables** in your hosting platform:

   - Heroku: `heroku config:set FIREBASE_PROJECT_ID=...`
   - Vercel: Add in project settings
   - AWS: Use Systems Manager Parameter Store

3. **Keep the same** Firebase project or create a production one

## Cost Estimation

### Firebase Free Tier (Spark Plan)

- Storage: **5 GB**
- Downloads: **1 GB/day**
- Uploads: **20,000/day**

### When to upgrade?

- If you exceed free tier limits
- Need more storage (5GB+ files)
- High traffic (>1GB downloads/day)

### Blaze Plan (Pay-as-you-go)

- Storage: **$0.026/GB/month**
- Downloads: **$0.12/GB**
- Very affordable for small to medium apps

## Questions?

- Firebase Documentation: https://firebase.google.com/docs/storage
- Firebase Console: https://console.firebase.google.com/
- Need help? Check the logs in your terminal for specific error messages
