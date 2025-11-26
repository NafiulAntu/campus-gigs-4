# Fix Conversation Names - User Guide

## Overview

The "Fix Names" feature repairs conversations where participant names are not displaying correctly. This can happen when:

- Old conversations were created before the participant info feature
- Data was corrupted or incomplete
- Backend sync issues occurred

## How to Use

### Step 1: Navigate to Messages

1. Click on the Messages icon in the sidebar
2. You'll see your list of conversations

### Step 2: Identify the Problem

If you see conversations showing:

- "User" instead of actual names
- Blank names
- Missing profile pictures

### Step 3: Click "Fix Names" Button

1. Look for the small "Fix Names" button in the top right of the Messages page (next to "Messages" title)
2. It has a refresh icon and says "Fix Names"
3. Click the button

### Step 4: Confirm the Action

1. A confirmation dialog will appear asking: "This will update all conversations to ensure names display correctly. Continue?"
2. Click "OK" to proceed

### Step 5: Wait for Completion

1. The button will show "Fixing..." with a loading spinner
2. The process typically takes a few seconds
3. You'll see an alert when complete: "Success! Fixed X out of Y conversations."

### Step 6: Reload Page

1. The page will automatically reload to show the updated names
2. All conversation names and profile pictures should now display correctly

## Technical Details

### What the Fix Does

1. Scans all your conversations in Firestore
2. Identifies conversations missing or incomplete `participantInfo`
3. Fetches user data from the backend for all participants
4. Updates Firestore with complete participant information:
   - User ID
   - Full name or username
   - Profile picture URL
   - Last read timestamp

### When to Use This Feature

- After migrating or importing conversations
- If you notice names not displaying
- After backend data updates
- When you see "User" instead of actual names

### Safety

- ✅ Does not delete any messages
- ✅ Does not modify existing participant info if already correct
- ✅ Only updates missing or incomplete data
- ✅ Preserves all message history and timestamps

## Troubleshooting

### Button Doesn't Work

- **Check**: Are you logged in?
- **Solution**: Make sure you're authenticated with a valid token

### Still Seeing "User" After Fix

- **Possible Cause**: User data doesn't exist in backend
- **Solution**:
  1. Verify the user exists in the database
  2. Check if the user has a `firebase_uid` set
  3. Run the fix again

### Error Message Appears

- **Check Console**: Press F12 and check the Console tab for error details
- **Common Issues**:
  - Network error: Check internet connection
  - Permission denied: Check Firestore security rules
  - API error: Check backend server is running

### Takes Too Long

- **Normal**: If you have many conversations (50+), it may take 10-30 seconds
- **Wait**: Don't refresh the page during the process
- **Patience**: Each conversation needs to fetch user data from the backend

## For Developers

### Implementation Files

- `FrontEnd/src/utils/fixConversations.js` - Main fix logic
- `FrontEnd/src/components/Post/side bar/messages.jsx` - UI integration

### API Endpoint Used

```
GET /api/users/firebase/:firebaseUid
```

### Firestore Update

```javascript
await updateDoc(conversationRef, {
  participantInfo: {
    [userId1]: { userId, name, photo, lastRead },
    [userId2]: { userId, name, photo, lastRead },
  },
});
```

### Required Permissions

- User must be authenticated
- Firestore rules must allow conversation updates
- Backend API must allow user data access

## Additional Notes

### Frequency of Use

- Usually only needed once after initial setup
- May need to run again after major data migrations
- Not needed for new conversations (they're created correctly)

### Performance Impact

- Minimal impact on Firestore reads/writes
- Batched updates prevent rate limiting
- Backend API calls are optimized

### Future Updates

- Automatic fix on login (planned)
- Background sync for old conversations (planned)
- Real-time participant info updates (planned)

---

**Questions or Issues?**
If you encounter problems not covered here, check the browser console (F12) for error details or contact support.
