# Authentication System Guide

## Overview

This application supports **dual authentication methods**:

1. **Firebase Authentication** (Primary - Currently Used in Frontend)
2. **Local Backend Authentication** (Alternative - Backend Only)

---

## 1. Firebase Authentication (Current Implementation)

### How It Works

- **Password Storage**: Passwords are securely hashed and stored in **Firebase's system**, NOT in our PostgreSQL database
- **Database Field**: `password` column in PostgreSQL = `NULL` for Firebase users
- **Why NULL?**: Firebase handles all password security. Our database only stores user metadata
- **Security**: Firebase uses industry-standard bcrypt with adaptive hashing

### User Flow

```
User Signs Up → Firebase creates account with hashed password
              ↓
         Firebase sends email verification
              ↓
         Backend receives Firebase token
              ↓
    Backend syncs user metadata (email, name, etc.)
              ↓
         Database stores: password = NULL, provider = 'firebase'
```

### Authentication Check

```javascript
// Firebase users authenticate like this:
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const token = await userCredential.user.getIdToken();
// Password verification happens in Firebase, not our backend
```

### Database Record Example (Firebase User)

```sql
SELECT id, email, password, provider FROM users WHERE email = 'user@gmail.com';
-- Result:
-- id: 1
-- email: user@gmail.com
-- password: NULL          ← This is CORRECT for Firebase users
-- provider: firebase
```

---

## 2. Local Backend Authentication (Alternative Method)

### How It Works

- **Password Storage**: Passwords are hashed with bcrypt (12 rounds) and stored in PostgreSQL
- **Database Field**: `password` column contains bcrypt hash
- **Endpoint**: `POST /api/auth/signup` (exists but not used by frontend)

### User Flow

```
User Signs Up → POST /api/auth/signup
              ↓
         Backend hashes password with bcrypt
              ↓
    Database stores: password = $2a$12$..., provider = 'local'
              ↓
         Backend returns JWT token
```

### Implementation

```javascript
// In authController.js (lines 8-76)
const hashedPassword = await bcrypt.hash(password, 12);
const user = await User.create({
  full_name,
  email,
  password: hashedPassword, // ← Bcrypt hash stored here
  provider: "local",
});
```

### Database Record Example (Local User)

```sql
SELECT id, email, password, provider FROM users WHERE email = 'local@gmail.com';
-- Result:
-- id: 2
-- email: local@gmail.com
-- password: $2a$12$eImiTXuWVxfM37uY4JANjQ...  ← Bcrypt hash
-- provider: local
```

---

## Current Setup

### Frontend (React)

- **Uses**: Firebase Authentication exclusively
- **File**: `FrontEnd/src/services/firebaseAuth.js`
- **Method**: `signUpWithEmail()` calls Firebase's `createUserWithEmailAndPassword()`

### Backend (Node.js/Express)

- **Supports**: Both Firebase and Local authentication
- **Firebase Route**: `POST /api/auth/firebase-sync` (used)
- **Local Route**: `POST /api/auth/signup` (exists but unused)

---

## Why Password is NULL for Firebase Users

### This is INTENTIONAL and SECURE ✅

1. **Separation of Concerns**: Firebase specializes in authentication security
2. **No Duplicate Storage**: Prevents storing passwords in two places
3. **Firebase Security Features**:

   - Automatic password strength enforcement
   - Rate limiting on login attempts
   - Built-in breach detection
   - Multi-factor authentication support
   - Automatic security updates

4. **Our Database**: Stores only user metadata (name, email, profile info)

---

## Switching to Local Authentication

If you want to use local backend authentication instead of Firebase:

### Step 1: Update Frontend Signup

Change `Signup.jsx` to call backend directly:

```javascript
// Current (Firebase):
const result = await signUpWithEmail(email, password, full_name);

// Change to (Local Backend):
const response = await fetch("http://localhost:5000/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    full_name,
    email,
    password,
    confirm_password: password,
    terms_agreed: true,
  }),
});
const result = await response.json();
```

### Step 2: Update Signin

Change `Signin.jsx`:

```javascript
// Current (Firebase):
const result = await signInWithEmail(email, password);

// Change to (Local Backend):
const response = await fetch("http://localhost:5000/api/auth/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const result = await response.json();
```

### Step 3: Update Middleware

The backend `authMiddleware.js` already supports both:

- Tries Firebase token first
- Falls back to JWT if Firebase fails
- No changes needed

---

## Security Notes

### Firebase Authentication

✅ **Pros**:

- Industry-leading security
- Email verification built-in
- Password reset flows handled
- No password storage liability
- Multi-factor auth ready

⚠️ **Cons**:

- Depends on Firebase service
- Requires Firebase SDK
- Free tier has limits

### Local Backend Authentication

✅ **Pros**:

- Full control over auth flow
- No external dependencies
- Works offline (in development)

⚠️ **Cons**:

- Must maintain security updates
- Responsible for password breaches
- Need to implement MFA separately
- More code to maintain

---

## Testing Authentication

### Check User's Auth Method

```sql
-- Check how a user is authenticated
SELECT
  id,
  email,
  CASE
    WHEN password IS NULL THEN 'Firebase (password in Firebase system)'
    ELSE 'Local (password hash: ' || LEFT(password, 20) || '...)'
  END as auth_method,
  provider
FROM users
WHERE email = 'test@gmail.com';
```

### Test Local Signup (Backend Only)

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@gmail.com",
    "password": "password123",
    "confirm_password": "password123",
    "terms_agreed": true
  }'
```

---

## Frequently Asked Questions

### Q: Why is the password NULL in the database?

**A**: Because you're using Firebase Authentication. Firebase stores passwords securely in their system. Your database only needs user metadata.

### Q: Is NULL password secure?

**A**: Yes! The password is stored in Firebase's secure system, which uses industry-standard encryption and security practices.

### Q: Can I use both Firebase and Local auth?

**A**: Yes, the backend supports both. The `provider` field indicates which method is used.

### Q: How do I know if password storage is working?

**A**:

- Firebase users: `password = NULL`, `provider = 'firebase'` ✅
- Local users: `password = $2a$12$...`, `provider = 'local'` ✅

### Q: Do I need to fix the NULL passwords?

**A**: No! NULL passwords for Firebase users is correct behavior. Don't change it.

---

## Summary

Your current setup is **working correctly**:

- ✅ Frontend uses Firebase Authentication
- ✅ Firebase stores passwords securely
- ✅ Database has `password = NULL` for Firebase users
- ✅ This is the intended design
- ✅ Passwords are safe in Firebase's system

**No action needed** unless you want to switch to local authentication.
