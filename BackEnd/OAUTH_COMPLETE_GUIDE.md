# 🚀 OAuth Setup - Complete Guide

## ⚡ Quick Start

Run this interactive setup script:

```bash
cd d:/C-Gigs-React/Campus/BackEnd
node setup-oauth.js
```

---

## 📋 Manual Setup (If you prefer step-by-step)

### 1️⃣ GitHub OAuth (2 minutes)

#### Steps:

1. **Go to:** https://github.com/settings/developers
2. **Click:** "New OAuth App" (green button)
3. **Fill in:**
   ```
   Application name: Campus Gigs
   Homepage URL: http://localhost:3004
   Authorization callback URL: http://localhost:3000/api/auth/github/callback
   ```
4. **Click:** "Register application"
5. **Copy:**
   - Client ID (looks like: `Iv1.abc123xyz789`)
   - Click "Generate a new client secret" and copy it immediately!

#### Add to .env:

```env
GITHUB_CLIENT_ID=Iv1.your_actual_client_id
GITHUB_CLIENT_SECRET=your_actual_secret_here
```

---

### 2️⃣ Google OAuth (5 minutes)

#### Steps:

1. **Go to:** https://console.cloud.google.com/
2. **Create Project:**
   - Click project dropdown (top left)
   - Click "New Project"
   - Name: "Campus Gigs"
   - Click "Create"
3. **Enable API:**
   - Go to: APIs & Services > Library
   - Search "Google+ API" or "Google People API"
   - Click "Enable"
4. **Create Credentials:**
   - Go to: APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - If prompted, configure consent screen:
     - User Type: External
     - App name: Campus Gigs
     - Your email for support
     - Skip optional fields
   - Application type: Web application
   - Add Authorized redirect URI:
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - Click "Create"
5. **Copy:**
   - Client ID (looks like: `123456-abc.apps.googleusercontent.com`)
   - Client Secret (looks like: `GOCSPX-abc123xyz`)

#### Add to .env:

```env
GOOGLE_CLIENT_ID=123456-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_actual_secret
```

---

### 3️⃣ LinkedIn OAuth (5 minutes)

#### Steps:

1. **Go to:** https://www.linkedin.com/developers/apps
2. **Click:** "Create app"
3. **Fill in:**
   - App name: Campus Gigs
   - LinkedIn Page: Select or create a company page
   - Privacy policy: `http://localhost:3004/privacy` (temporary)
   - Upload any logo (temporary)
   - Agree to terms
4. **Click:** "Create app"
5. **Configure Auth:**
   - Go to "Auth" tab
   - Under "OAuth 2.0 settings"
   - Add Redirect URL:
     ```
     http://localhost:3000/api/auth/linkedin/callback
     ```
   - Click "Update"
6. **Get Credentials:**
   - In "Auth" tab, find "Application credentials"
   - Copy Client ID
   - Click "Show" next to Client Secret and copy it
7. **Request Product Access:**
   - Go to "Products" tab
   - Find "Sign In with LinkedIn using OpenID Connect"
   - Click "Request access"
   - (Usually approved instantly for development)

#### Add to .env:

```env
LINKEDIN_CLIENT_ID=86your_actual_id
LINKEDIN_CLIENT_SECRET=your_actual_secret
```

---

## 🔄 After Adding Credentials

1. **Save the .env file**
2. **Restart your servers:**
   ```bash
   cd d:/C-Gigs-React/Campus
   npm run dev
   ```
3. **Test the OAuth buttons!**

---

## 🧪 Testing

### Test GitHub Login:

```bash
# Backend should redirect you to GitHub
curl http://localhost:3000/api/auth/github
```

### Test in Browser:

1. Open: http://localhost:3004
2. Click "Sign in with GitHub"
3. Authorize the app
4. Should redirect back with token!

---

## ❌ Troubleshooting

### Error: "OAuth client was not found" (401)

- ✅ Make sure you copied the REAL Client ID (not placeholder text)
- ✅ Check .env file has actual values, not "your_google_client_id_here"

### Error: "404 not found"

- ✅ Make sure OAuth app is created on provider's website
- ✅ Check callback URL matches exactly

### Error: "invalid_client"

- ✅ Double-check Client ID and Secret are correct
- ✅ Make sure there are no extra spaces in .env file

### Redirect URI mismatch

- ✅ Backend callback must be: `http://localhost:3000/api/auth/[provider]/callback`
- ✅ Make sure it's http:// not https:// for local development

---

## 📝 Quick Reference

| Provider | Dev Portal                                        | Callback URL                                     |
| -------- | ------------------------------------------------- | ------------------------------------------------ |
| GitHub   | https://github.com/settings/developers            | http://localhost:3000/api/auth/github/callback   |
| Google   | https://console.cloud.google.com/apis/credentials | http://localhost:3000/api/auth/google/callback   |
| LinkedIn | https://www.linkedin.com/developers/apps          | http://localhost:3000/api/auth/linkedin/callback |

---

## 🎯 What You Get

✅ Users can sign up/login with GitHub account
✅ Users can sign up/login with Google/Gmail account  
✅ Users can sign up/login with LinkedIn account
✅ Automatic account creation on first OAuth login
✅ Email and profile info auto-filled from OAuth provider

---

**Need help? Run the interactive setup:**

```bash
cd d:/C-Gigs-React/Campus/BackEnd
node setup-oauth.js
```
