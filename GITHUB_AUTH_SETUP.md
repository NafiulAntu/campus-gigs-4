# GitHub Authentication Setup Guide

## ✅ Code Changes Complete

GitHub sign-in is now enabled in your Signin and Signup components!

---

## 🔧 Firebase Console Setup (Required)

### Step 1: Create GitHub OAuth App

1. Go to **GitHub** → **Settings** → **Developer settings** → **OAuth Apps**

   - Direct link: https://github.com/settings/developers

2. Click **"New OAuth App"**

3. Fill in the Application details:

   ```
   Application name: Campus Gigs
   Homepage URL: http://localhost:3000
   Application description: Campus Gigs Authentication
   Authorization callback URL: https://campus-gigs-33f61.firebaseapp.com/__/auth/handler
   ```

4. Click **"Register application"**

5. You'll see:
   - **Client ID** - Copy this
   - Click **"Generate a new client secret"**
   - **Client Secret** - Copy this (shown only once!)

---

### Step 2: Enable GitHub in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)

2. Select your project: **campus-gigs-33f61**

3. Click **Authentication** → **Sign-in method** tab

4. Find **GitHub** in the list, click on it

5. Toggle **Enable** to ON

6. Paste the credentials from GitHub:

   - **Client ID**: (paste from GitHub OAuth App)
   - **Client Secret**: (paste from GitHub OAuth App)

7. **Copy the callback URL** shown in Firebase (should be the same as what you entered in GitHub)

8. Click **Save**

---

### Step 3: Update GitHub OAuth App (if needed)

If Firebase shows a different callback URL:

1. Go back to GitHub OAuth App settings
2. Update the **Authorization callback URL** to match Firebase exactly
3. Save changes

---

## 🧪 Testing GitHub Sign-In

### Test on Signin Page:

1. Open http://localhost:3000/login
2. Click the **GitHub** button
3. Authorize "Campus Gigs" app
4. Expected: Redirect to /post page

### Test on Signup Page:

1. Open http://localhost:3000/signup
2. Click the **GitHub** button
3. Authorize the app
4. Expected: Account created → Redirect to /post page

---

## 🔍 Verify in Database

After signing in with GitHub, check PostgreSQL:

```sql
SELECT id, email, full_name, firebase_uid, provider, profile_picture
FROM users
WHERE provider = 'firebase'
ORDER BY created_at DESC;
```

You should see:

- `provider`: "firebase"
- `firebase_uid`: Your GitHub Firebase UID
- `email`: Your GitHub email
- `profile_picture`: Your GitHub avatar URL

---

## 🐛 Troubleshooting

### "Error: popup_closed_by_user"

- **Cause**: User closed the popup before completing auth
- **Solution**: Try again, don't close the popup

### "Error: auth/account-exists-with-different-credential"

- **Cause**: Email already used with another provider (Google/Email)
- **Solution**: Sign in with the original provider first

### "Error: auth/unauthorized-domain"

- **Cause**: localhost not in authorized domains
- **Solution**: Firebase Console → Authentication → Settings → Authorized domains → Add "localhost"

### "Error: redirect_uri_mismatch"

- **Cause**: GitHub callback URL doesn't match Firebase
- **Solution**: Copy exact callback URL from Firebase to GitHub OAuth App

### GitHub popup doesn't open

- **Cause**: Popup blocked by browser
- **Solution**: Allow popups for localhost:3000

---

## 📋 Quick Checklist

- [ ] Created GitHub OAuth App
- [ ] Copied Client ID and Client Secret
- [ ] Enabled GitHub in Firebase Console
- [ ] Pasted credentials into Firebase
- [ ] Saved changes in Firebase
- [ ] Verified callback URL matches
- [ ] Tested GitHub sign-in
- [ ] Checked user created in PostgreSQL

---

## 🎯 What's Working Now

✅ **Email/Password**: Ready to use
✅ **Google Sign-In**: Ready to use  
✅ **GitHub Sign-In**: Ready after Firebase Console setup

---

## 📝 Important Notes

### GitHub Email Privacy:

- If GitHub email is private, Firebase may not receive it
- User can make email public in GitHub settings
- Or use GitHub's noreply email

### Multiple Accounts:

- Same email can't be used across different providers
- Firebase links accounts by email
- User must sign in with original provider

### Profile Picture:

- GitHub avatar is automatically synced
- Stored in PostgreSQL `profile_picture` column

---

## 🚀 Production Setup

For production deployment:

1. **GitHub OAuth App**:

   - Add production URL to Homepage URL
   - Add production callback: `https://your-domain.com/__/auth/handler`

2. **Firebase Console**:

   - Add production domain to Authorized domains
   - Verify GitHub credentials are correct

3. **Test on Production**:
   - Verify GitHub sign-in works
   - Check user data syncs correctly

---

## ✨ Current Status

✅ Frontend Code: GitHub auth enabled
✅ Backend: Ready to accept GitHub users
✅ Database: firebase_uid column ready
✅ Auth Flow: Complete

**Next Step**: Set up GitHub OAuth App and enable in Firebase Console (5 minutes)

---

## 🔗 Useful Links

- GitHub OAuth Apps: https://github.com/settings/developers
- Firebase Console: https://console.firebase.google.com/
- Firebase Auth Docs: https://firebase.google.com/docs/auth/web/github-auth
- GitHub OAuth Docs: https://docs.github.com/en/developers/apps/building-oauth-apps

---

Need help? Check the troubleshooting section or verify each step carefully!
