# Messaging System - Testing Checklist ✅

Use this checklist to verify your messaging system is working correctly.

---

## 🔧 Pre-Testing Setup

### 1. Install Dependencies

- [ ] Backend: `cd BackEnd && npm install` (Socket.io should be installed)
- [ ] Frontend: `cd FrontEnd && npm install` (socket.io-client should be installed)

### 2. Start Servers

- [ ] Backend running: `cd BackEnd && npm start`
- [ ] Frontend running: `cd FrontEnd && npm run dev`
- [ ] Backend console shows: `✅ Socket.io server initialized`
- [ ] Backend console shows: `🔌 WebSocket server ready for connections`

### 3. Firebase Configuration

- [ ] Firebase project exists
- [ ] Firestore database enabled
- [ ] Firebase Auth configured
- [ ] `FrontEnd/src/config/firebase.js` has correct config

---

## 🧪 Functional Tests

### Test 1: Socket Connection

**Goal**: Verify Socket.io connects successfully

1. [ ] Open frontend in browser: http://localhost:5173
2. [ ] Login with a user account
3. [ ] Open browser console (F12)
4. [ ] Look for: `✅ Socket.io connected: <socket-id>`
5. [ ] Check connection status shows: 🟢 Connected

**If failed**: Check backend is running, Firebase token is valid

---

### Test 2: Send Message

**Goal**: Verify messages can be sent

1. [ ] Navigate to another user's profile
2. [ ] Click "Message" button
3. [ ] Chat window opens
4. [ ] Type a message in the input field
5. [ ] Click send button (📤)
6. [ ] Message appears in chat window
7. [ ] Message shows timestamp
8. [ ] Message shows ✓ (sent) indicator

**If failed**: Check Firestore permissions, check socket connection

---

### Test 3: Receive Message (Real-Time)

**Goal**: Verify messages are received instantly

1. [ ] Open two browsers (or incognito + normal)
2. [ ] Login as User A in Browser 1
3. [ ] Login as User B in Browser 2
4. [ ] User A starts conversation with User B
5. [ ] User A sends message
6. [ ] User B sees message **instantly** (< 1 second)
7. [ ] No page refresh needed

**If failed**: Check both users are connected, check conversation room

---

### Test 4: Typing Indicator

**Goal**: Verify typing indicators work

1. [ ] Have two browsers with User A and User B
2. [ ] Both users in same conversation
3. [ ] User A starts typing
4. [ ] User B sees "typing..." status in header
5. [ ] User B sees three bouncing dots at bottom
6. [ ] After 2 seconds of inactivity, typing stops
7. [ ] User B no longer sees typing indicator

**If failed**: Check both users are online and connected

---

### Test 5: Read Receipts

**Goal**: Verify read receipts display correctly

1. [ ] User A sends message to User B
2. [ ] User A sees ✓ next to message (sent)
3. [ ] User B opens conversation
4. [ ] User B's chat window displays message
5. [ ] User A sees ✓✓ next to message (read)
6. [ ] Message marked as read in Firestore

**If failed**: Check `markAsRead()` is being called, check Firestore updates

---

### Test 6: Online/Offline Status

**Goal**: Verify presence tracking works

1. [ ] User A views User B's profile
2. [ ] User B is online → Profile shows green dot + "online"
3. [ ] User B closes browser
4. [ ] After 10 seconds, User A sees "offline" status
5. [ ] Green dot disappears from User B's avatar

**If failed**: Check presence tracking in Socket.io, check Firestore `presence` collection

---

### Test 7: Message Persistence

**Goal**: Verify messages are stored in Firestore

1. [ ] Send several messages between User A and User B
2. [ ] Close browser completely
3. [ ] Re-open browser and login
4. [ ] Navigate to the conversation
5. [ ] All previous messages are visible
6. [ ] Messages loaded from Firestore

**If failed**: Check Firestore `conversations/{id}/messages` collection

---

### Test 8: Conversation List

**Goal**: Verify conversations are listed correctly

1. [ ] Login as a user with multiple conversations
2. [ ] Navigate to Messages page
3. [ ] All conversations are listed
4. [ ] Each shows last message preview
5. [ ] Each shows time of last message
6. [ ] Conversations sorted by most recent

**If failed**: Check Firestore query in `messages.jsx`

---

### Test 9: Unread Count

**Goal**: Verify unread message badges work

1. [ ] User A sends message to User B
2. [ ] User B has not opened the conversation
3. [ ] User B sees unread count badge (e.g., "2")
4. [ ] User B opens conversation
5. [ ] Unread count resets to 0
6. [ ] Badge disappears

**If failed**: Check `incrementUnreadCount()` and `resetUnreadCount()` functions

---

### Test 10: Message History Scrolling

**Goal**: Verify chat can handle many messages

1. [ ] Send 20+ messages in a conversation
2. [ ] Chat window scrolls automatically to bottom
3. [ ] Can scroll up to see old messages
4. [ ] New messages auto-scroll to bottom
5. [ ] No performance issues with many messages

**If failed**: Check `messagesEndRef` and `scrollIntoView` in ChatWindow

---

## 🎨 UI/UX Tests

### Test 11: Visual Design

- [ ] Chat window has purple gradient header
- [ ] Messages have rounded bubbles
- [ ] Own messages are right-aligned (purple background)
- [ ] Other messages are left-aligned (white background)
- [ ] Timestamps are relative (e.g., "2m ago")
- [ ] Send button is round with gradient background
- [ ] Typing indicator has animated dots

### Test 12: Responsive Design

- [ ] Chat works on desktop (1920x1080)
- [ ] Chat works on tablet (768px)
- [ ] Chat works on mobile (375px)
- [ ] Messages are properly sized on all screens
- [ ] Input field is accessible on mobile keyboard

### Test 13: Animations

- [ ] Messages slide in smoothly when received
- [ ] Typing dots bounce with animation
- [ ] Send button scales on hover
- [ ] Connection status changes color smoothly

---

## 🔐 Security Tests

### Test 14: Authentication

- [ ] Cannot send messages without login
- [ ] WebSocket connection requires Firebase token
- [ ] Invalid tokens are rejected
- [ ] Cannot send messages to random users

### Test 15: Authorization

- [ ] Can only read own conversations
- [ ] Cannot read other users' messages
- [ ] Sender ID is verified on backend
- [ ] Message tampering is prevented

---

## 📊 Performance Tests

### Test 16: Speed

- [ ] Message delivery < 100ms (same network)
- [ ] Typing indicator < 50ms
- [ ] Read receipts < 200ms
- [ ] Page load with 100 messages < 2 seconds

### Test 17: Load

- [ ] Can handle 10+ simultaneous conversations
- [ ] Can handle 100+ messages per conversation
- [ ] No memory leaks after extended use
- [ ] Browser doesn't freeze or lag

---

## 🐛 Error Handling Tests

### Test 18: Connection Loss

1. [ ] Start a conversation
2. [ ] Disable internet connection
3. [ ] Status shows 🔴 Disconnected
4. [ ] Cannot send messages (button disabled)
5. [ ] Re-enable internet
6. [ ] Status shows 🟢 Connected
7. [ ] Can send messages again

### Test 19: Backend Crash

1. [ ] Start a conversation
2. [ ] Stop backend server
3. [ ] Frontend shows disconnected status
4. [ ] No JavaScript errors in console
5. [ ] Restart backend
6. [ ] Frontend reconnects automatically

### Test 20: Invalid Data

- [ ] Empty messages are not sent
- [ ] Whitespace-only messages are not sent
- [ ] Long messages (1000+ chars) are handled
- [ ] Special characters (emoji, symbols) work
- [ ] HTML/script tags are sanitized

---

## 📈 Firestore Verification

### Test 21: Database Structure

1. [ ] Open Firebase Console
2. [ ] Check `conversations` collection exists
3. [ ] Check conversation has `participants` array
4. [ ] Check conversation has `lastMessageTime`
5. [ ] Check `conversations/{id}/messages` subcollection exists
6. [ ] Check messages have `senderId`, `receiverId`, `content`, `timestamp`

### Test 22: Firestore Security Rules

- [ ] Authenticated users can read own conversations
- [ ] Authenticated users can write to own conversations
- [ ] Unauthenticated users cannot read/write
- [ ] Users cannot read other users' conversations

---

## ✅ Final Verification

### All Green Checkmarks?

If all tests pass:

- ✅ **Messaging system is production-ready!**
- ✅ **Real-time features working correctly**
- ✅ **Security is properly configured**
- ✅ **UI is polished and professional**

### Some Tests Failed?

Refer to:

- `MESSAGING_SYSTEM_GUIDE.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Architecture overview
- Browser console (F12) - Error messages
- Backend logs - Server errors

---

## 📝 Notes

**Test Environment**:

- Date: ********\_********
- Backend Port: 5000
- Frontend Port: 5173
- Firebase Project: campus-gigs-33f61
- Tester: ********\_********

**Issues Found**:

```
1.
2.
3.
```

**Resolution**:

```
1.
2.
3.
```

---

**Testing Complete! ✅**

If all tests pass, your messaging system is ready for production use!
