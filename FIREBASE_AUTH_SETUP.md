# Firebase Authentication Setup Guide

## ✅ What's Been Implemented

### Backend Changes:

1. **Database Migration**: Added `firebase_uid` column to users table
2. **User Model**: Added methods for Firebase UID handling:
   - `findByFirebaseUid()` - Find user by Firebase UID
   - `upsertFirebaseUser()` - Create/update user from Firebase
   - `linkFirebaseUid()` - Link Firebase UID to existing user
3. **Auth Middleware**: Updated to support both Firebase tokens and JWT
4. **Auth Controller**: Added `firebaseSync` endpoint
5. **Auth Routes**: Added POST `/api/auth/firebase-sync` endpoint
6. **Firebase Admin SDK**: Initialized for token verification

### Frontend Changes:

1. **firebaseAuth.js Service**: Complete authentication service with:
   - Email/password authentication
   - Google Sign-In
   - GitHub Sign-In (prepared)
   - Password reset
   - Token management
2. **Signin Component**: Updated to use Firebase Auth
3. **Signup Component**: Updated to use Firebase Auth
4. **API Service**: Added `syncUserWithBackend()` function

---

## 🔧 Next Steps: Enable Authentication in Firebase Console

### Step 1: Enable Email/Password Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **campus-gigs-33f61**
3. Click **Authentication** in the left sidebar
4. Click **Get Started** (if first time)
5. Go to **Sign-in method** tab
6. Click **Email/Password**
7. Enable both:
   - **Email/Password** (toggle ON)
   - **Email link (passwordless sign-in)** (optional, can keep OFF)
8. Click **Save**

### Step 2: Enable Google Sign-In

1. In **Sign-in method** tab, click **Google**
2. Toggle **Enable** to ON
3. **Project support email**: Select your email (nafiul.nia@gmail.com)
4. Click **Save**

**Note**: Google Sign-In should work immediately for localhost testing. For production:

- Add your production domain to **Authorized domains**
- Configure OAuth consent screen in Google Cloud Console

### Step 3: Configure Authorized Domains

1. In **Sign-in method** tab, scroll to **Authorized domains**
2. Verify these domains are listed:
   - `localhost` (should be there by default)
   - Your production domain (add when deploying)

---

## 🧪 Testing the Implementation

### Test Email/Password Signup:

1. Open your browser: http://localhost:3000
2. Navigate to **Sign Up** page
3. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test1234
   - Confirm Password: test1234
   - Check "I agree to terms"
4. Click **Sign Up**
5. Expected: Success message → Redirect to /post page

### Test Email/Password Sign In:

1. Navigate to **Sign In** page
2. Enter credentials:
   - Email: test@example.com
   - Password: test1234
3. Click **Sign In**
4. Expected: Success message → Redirect to /post page

### Test Google Sign-In:

1. Navigate to **Sign In** page
2. Click the **Gmail** button
3. Select your Google account
4. Grant permissions
5. Expected: Success message → Redirect to /post page

---

## 🔍 Verification Steps

### Check User Created in PostgreSQL:

```sql
SELECT id, email, full_name, firebase_uid, provider, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;
```

### Check Firebase Authentication Users:

1. Go to Firebase Console → Authentication → Users tab
2. You should see new users listed there
3. Each user will have a UID matching the `firebase_uid` in PostgreSQL

### Check Browser Storage:

1. Open DevTools (F12)
2. Go to **Application** tab → **Local Storage**
3. Check for:
   - `token` - Firebase ID token (long JWT string)
   - `user` - User object with PostgreSQL data

---

## 🎯 How It Works

### Authentication Flow:

```
User enters credentials → Firebase Auth → Get ID Token →
Sync with Backend → Store token → Redirect to app
```

### Token Verification Flow:

```
Frontend request → Include Firebase token in Authorization header →
Backend middleware → Verify with Firebase Admin SDK →
Find/create user in PostgreSQL → Allow request
```

### Dual Token Support:

- Backend accepts **both** Firebase tokens and JWT tokens
- Existing JWT users can still log in
- New Firebase Auth users get Firebase tokens
- Gradual migration path without breaking changes

---

## 📝 Important Notes

### Token Storage:

- Firebase ID tokens are stored in `localStorage`
- Tokens expire after 1 hour (Firebase default)
- Frontend should handle token refresh (implement later if needed)

### User Data:

- **Firebase**: Handles authentication only
- **PostgreSQL**: Stores all user data (profile, posts, etc.)
- `firebase_uid` links the two systems

### Security:

- Firebase Admin SDK verifies tokens on backend
- No password storage in PostgreSQL for Firebase users
- Service account credentials are in `.env` (keep secure!)

---

## 🚀 Production Deployment Checklist

Before deploying to production:

1. **Environment Variables**:

   - Add Firebase credentials to production .env
   - Use environment secrets (not committed to git)

2. **Firebase Console**:

   - Add production domain to Authorized domains
   - Configure OAuth consent screen
   - Review security rules

3. **Google OAuth**:

   - Add production redirect URIs in Google Cloud Console
   - Verify OAuth client ID and secret

4. **Testing**:
   - Test all auth methods in production
   - Verify token refresh works
   - Test protected routes

---

## 🐛 Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"

- **Solution**: Enable Email/Password in Firebase Console (Step 1 above)

### "Firebase: Error (auth/popup-blocked)"

- **Solution**: Allow popups in browser for Google Sign-In

### "User not found" after Firebase login

- **Solution**: Check backend logs, verify Firebase Admin SDK initialized

### Token verification fails

- **Solution**: Check Firebase credentials in .env, restart backend server

### Google Sign-In doesn't open popup

- **Solution**: Check browser console for errors, verify Google provider enabled

---

## ✨ Current Status

✅ Backend: Running on http://localhost:5000
✅ Frontend: Running on http://localhost:3000
✅ Firebase Admin SDK: Initialized (Auth only)
✅ Database: firebase_uid column added
✅ Middleware: Dual token support active
✅ Components: Updated to use Firebase Auth

**Ready to test!** Just enable authentication methods in Firebase Console.

---

## 📞 Need Help?

If you encounter issues:

1. Check browser console for errors
2. Check backend terminal for logs
3. Verify Firebase Console settings
4. Check network tab for failed requests
