# OAuth and Password Reset Setup Guide

## ✅ Features Implemented

### 1. **Remember Me** ✅ READY

- Token expires in 30 days if checked
- Token expires in 7 days if unchecked
- **Status:** Working - No setup needed

### 2. **Forgot Password** ✅ READY

- Users can request password reset
- Reset link valid for 1 hour
- **Status:** Working - Email integration optional

### 3. **OAuth Login (Gmail, GitHub, LinkedIn)** ⚠️ REQUIRES SETUP

---

## 🔧 OAuth Setup Instructions

### **Google OAuth (Gmail)**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type: "Web application"
6. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
7. Copy your **Client ID** and **Client Secret**
8. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

### **GitHub OAuth**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: Campus Gigs
   - Homepage URL: `http://localhost:3004`
   - Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy your **Client ID** and **Client Secret**
5. Add to `.env`:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   ```

### **LinkedIn OAuth**

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create a new app
3. Add redirect URL: `http://localhost:3000/api/auth/linkedin/callback`
4. Get **Client ID** and **Client Secret** from "Auth" tab
5. Add to `.env`:
   ```env
   LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
   ```

---

## 📧 Email Setup (Optional for Forgot Password)

### **Using Gmail**

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Factor Authentication
3. Generate App Password:
   - Go to Security → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-character password
4. Add to `.env`:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_16_character_app_password
   ```

---

## 🚀 Testing

### **Test Remember Me**

```bash
# Login with rememberMe: true
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","rememberMe":true}'
# Token will expire in 30 days
```

### **Test Forgot Password**

```bash
# Request reset link
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Will return reset link (in development)
# In production, this will be sent via email
```

### **Test OAuth**

1. Start servers: Backend (port 3000) and Frontend (port 3004)
2. Click "Continue with Gmail/GitHub/LinkedIn"
3. After OAuth setup, it will redirect back with token

---

## 📝 Current Status

| Feature         | Backend | Frontend | Setup Required      |
| --------------- | ------- | -------- | ------------------- |
| Remember Me     | ✅      | ✅       | ❌ No               |
| Forgot Password | ✅      | ✅       | ⚠️ Optional (Email) |
| Reset Password  | ✅      | ✅       | ❌ No               |
| Google OAuth    | ✅      | ✅       | ⚠️ Yes              |
| GitHub OAuth    | ✅      | ✅       | ⚠️ Yes              |
| LinkedIn OAuth  | ✅      | ✅       | ⚠️ Yes              |

---

## 🎯 Quick Start

### **Without OAuth (Works Now)**

1. Restart backend server
2. Test signup/signin with Remember Me checkbox
3. Test forgot password → reset password flow

### **With OAuth (After Setup)**

1. Complete OAuth setup above
2. Add credentials to `.env`
3. Restart backend server
4. Click OAuth buttons - they'll work!

---

## 🔗 API Endpoints

### Auth

- `POST /api/auth/signup` - Register
- `POST /api/auth/signin` - Login (supports rememberMe)
- `POST /api/auth/forgot-password` - Request reset link
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/profile` - Get current user (protected)

### OAuth

- `GET /api/auth/google` - Start Google OAuth
- `GET /api/auth/google/callback` - Google callback
- `GET /api/auth/github` - Start GitHub OAuth
- `GET /api/auth/github/callback` - GitHub callback
- `GET /api/auth/linkedin` - Start LinkedIn OAuth
- `GET /api/auth/linkedin/callback` - LinkedIn callback

All features are implemented and ready to use! 🎉
