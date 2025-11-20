# Quick OAuth Setup - Step by Step

## 🚨 CURRENT ISSUE

The `.env` file has placeholder values like "your_google_client_id_here" - we need REAL credentials!

## 🎯 EASIEST SOLUTION - Get Real Credentials

I'll guide you through each one. Let's start with the easiest:

---

## 1️⃣ GITHUB OAUTH (Easiest - Takes 2 minutes)

### Step 1: Go to GitHub

1. Open: https://github.com/settings/developers
2. Click **"New OAuth App"** button

### Step 2: Fill the Form

```
Application name: Campus Gigs
Homepage URL: http://localhost:3004
Authorization callback URL: http://localhost:3000/api/auth/github/callback
```

### Step 3: Get Credentials

1. Click **"Register application"**
2. You'll see:
   - **Client ID**: Copy this (looks like: Iv1.a1b2c3d4e5f6g7h8)
   - Click **"Generate a new client secret"**
   - **Client Secret**: Copy this immediately (you can only see it once!)

### Step 4: Update .env

Open: `d:\C-Gigs-React\Campus\BackEnd\.env`

Replace these lines:

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
```

With your actual values:

```env
GITHUB_CLIENT_ID=Iv1.a1b2c3d4e5f6g7h8
GITHUB_CLIENT_SECRET=abc123xyz789yoursecrethere
```

---

## 2️⃣ GOOGLE OAUTH (Gmail) (Takes 5 minutes)

### Step 1: Go to Google Cloud Console

1. Open: https://console.cloud.google.com/
2. Create a new project:
   - Click project dropdown (top left)
   - Click **"New Project"**
   - Name: "Campus Gigs"
   - Click **"Create"**

### Step 2: Enable Google+ API

1. Go to: https://console.cloud.google.com/apis/library
2. Search for "Google+ API"
3. Click it and click **"Enable"**

### Step 3: Create OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If asked, configure consent screen:
   - User Type: **External**
   - App name: Campus Gigs
   - User support email: your email
   - Developer contact: your email
   - Click **"Save and Continue"** (skip scopes and test users)
4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: Campus Gigs Web
   - Authorized redirect URIs: Add:
     ```
     http://localhost:3000/api/auth/google/callback
     ```
   - Click **"Create"**

### Step 4: Get Credentials

1. You'll see a popup with:
   - **Client ID**: Copy it (looks like: 123456789-abc123.apps.googleusercontent.com)
   - **Client Secret**: Copy it (looks like: GOCSPX-abc123xyz789)

### Step 5: Update .env

```env
GOOGLE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123xyz789
```

---

## 3️⃣ LINKEDIN OAUTH (Takes 5 minutes)

### Step 1: Create LinkedIn App

1. Open: https://www.linkedin.com/developers/apps
2. Click **"Create app"**
3. Fill the form:
   - App name: Campus Gigs
   - LinkedIn Page: Select or create one
   - Privacy policy URL: http://localhost:3004/privacy (can be temporary)
   - App logo: Upload any logo (can be temporary)
4. Agree to terms and click **"Create app"**

### Step 2: Configure OAuth

1. Go to **"Auth"** tab
2. Add Redirect URL:
   ```
   http://localhost:3000/api/auth/linkedin/callback
   ```
3. Click **"Update"**

### Step 3: Get Credentials

1. In the **"Auth"** tab, you'll see:
   - **Client ID**: Copy it (looks like: 86abc123xyz789)
   - **Client Secret**: Copy it (click "Show" first)

### Step 4: Request Permissions

1. Go to **"Products"** tab
2. Request access to:
   - **Sign In with LinkedIn** (click "Request access")
   - Wait for approval (usually instant for development)

### Step 5: Update .env

```env
LINKEDIN_CLIENT_ID=86abc123xyz789
LINKEDIN_CLIENT_SECRET=yoursecrethere123
```

---

## 🚀 AFTER GETTING CREDENTIALS

1. **Update your .env file** with real credentials
2. **Restart backend server**:
   ```bash
   cd d:/C-Gigs-React/Campus/BackEnd
   node server.js
   ```
3. **Test the buttons** - They should work now!

---

## ⚡ ALTERNATIVE: Disable OAuth Temporarily

If you want to test other features first, I can disable OAuth buttons for now and you can set them up later.

Let me know:

1. Do you want me to guide you through getting credentials? (I can help step by step)
2. Or temporarily disable OAuth buttons?

---

## 📝 TROUBLESHOOTING

### Error: "OAuth client was not found"

- ✅ Solution: Use REAL credentials (not placeholder text)

### Error: "404 not found"

- ✅ Solution: Create GitHub OAuth app first
- ✅ Make sure callback URL is: http://localhost:3000/api/auth/github/callback

### Error: "invalid_client"

- ✅ Solution: Use actual Client ID and Secret (copy from OAuth app settings)

---

**Which option do you prefer?**
A) I'll help you get real credentials (takes ~10 minutes total)
B) Disable OAuth buttons for now (works immediately)
