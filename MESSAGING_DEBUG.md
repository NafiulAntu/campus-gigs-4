# Messaging Debug Guide

## Issue

Users cannot send messages - "Failed to start conversation" error

## Root Cause Analysis

The messaging system requires Firebase UIDs for both users in a conversation. However, there are multiple authentication methods in the app:

1. **Firebase Authentication** (Google/GitHub OAuth) - Creates users with `firebase_uid`
2. **Local Authentication** (Backend email/password) - Creates users WITHOUT `firebase_uid`

## The Problem

When a user tries to message another user who signed up via local authentication (not Firebase), the `firebase_uid` will be `null`, causing the conversation creation to fail.

## Solution Steps

### 1. Check Browser Console

Open the browser console and look for:

- "User does not have a Firebase UID" message
- Firestore permission errors
- The user object being logged

### 2. Test Firebase Authentication

The messaging will ONLY work between users who are authenticated with Firebase (not local backend auth).

Users must sign up/login using:

- Firebase Email/Password (not the backend /api/auth/signup endpoint)
- Google OAuth
- GitHub OAuth

### 3. Firestore Security Rules

Make sure Firestore security rules allow conversation creation:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;

      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }

    // Allow users to manage their own presence
    match /presence/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Migration Path (Optional)

To allow existing local users to use messaging, you would need to:

1. Have them login with Firebase authentication
2. Link their local account to their Firebase account
3. Update the `firebase_uid` in the database

## Current Fix Applied

1. ✅ Added validation to check if user has firebase_uid before creating conversation
2. ✅ Added better error logging to identify the exact issue
3. ✅ Added more specific error messages based on error codes

## Next Steps

1. Test with two users who are both authenticated via Firebase
2. Check browser console for detailed error messages
3. Verify Firestore security rules are properly configured
