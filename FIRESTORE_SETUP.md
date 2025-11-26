# Firestore Setup for Messaging

## Required Composite Index

For the messaging feature to work properly, you need to create a composite index in Firestore.

### Steps to Create Index:

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: campus-gigs or your project name
3. **Navigate to Firestore Database**
4. **Click on "Indexes" tab**
5. **Click "Create Index"** or click the link in the browser console error message

### Index Configuration:

**Collection ID**: `conversations`

**Fields to index**:

- `participants` - Array-contains
- `lastMessageTime` - Descending

**Query scope**: Collection

### Alternative: Use Console Error Link

When you first try to load conversations, check the browser console (F12). If you see an error about missing index, it will include a direct link like:

```
https://console.firebase.google.com/project/YOUR_PROJECT/firestore/indexes?create_composite=...
```

Click that link to automatically create the index with correct settings.

### Index Creation Time

After creating the index:

- Status will show "Building..."
- Usually takes 2-5 minutes to complete
- Refresh the page once status shows "Enabled"

## Testing

After index is created:

1. **Search for a user** in the Messages section
2. **Click on a search result** to start a conversation
3. **Send a message**
4. **Go back to conversation list** - you should see the conversation saved
5. **Refresh the page** - conversation should still be there

## Troubleshooting

### "Failed Precondition" Error

- This means the composite index is not created yet
- Follow the link in the console error to create it

### Conversations Not Showing

1. Check browser console for errors
2. Verify Firebase Authentication is working (user is logged in)
3. Verify Firestore security rules allow reading conversations:
   ```javascript
   allow read, write: if request.auth != null;
   ```

### Conversations Show But Don't Update

- Check that messages are being sent successfully
- Verify `lastMessage` and `lastMessageTime` are being updated in Firestore
- Check the conversation document in Firestore Database to see actual data

## Current Security Rules

Make sure your Firestore rules (in Firebase Console > Firestore > Rules) include:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Conversations - only authenticated users
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null;

      // Messages subcollection
      match /messages/{messageId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

## How It Works

1. **User searches** for another user (@username)
2. **Clicks on result** - creates conversation document in Firestore
3. **Conversation document** contains:

   - `participants`: Array of 2 Firebase UIDs
   - `participantInfo`: Object with both users' names and photos
   - `lastMessage`: Text of last message
   - `lastMessageTime`: Timestamp for sorting
   - `unreadCount`: Object tracking unread for each user

4. **Real-time listener** in Messages component automatically updates when:

   - New conversation is created
   - New message is sent
   - Conversation data changes

5. **Conversation appears** in "YOUR CONVERSATIONS" list instantly
