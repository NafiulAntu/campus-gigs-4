# Hybrid Messaging System - Setup & Usage Guide

## Overview

Your Campus Gigs app now has a **hybrid real-time messaging system** that combines:

- **Socket.io** for instant message delivery (low latency)
- **Firebase Firestore** for message persistence and offline sync
- **Firebase Cloud Messaging (FCM)** for push notifications when users are offline

This hybrid approach is cost-effective and provides the best user experience.

---

## Architecture

### Message Flow

```
User sends message
    ↓
Socket.io (instant delivery to online users)
    ↓
Firestore (persist message)
    ↓
FCM Push (notify offline users)
```

### Components Created

#### Backend

- **`BackEnd/socketServer.js`** - Socket.io server with Firebase auth
- **`BackEnd/server.js`** - Updated to integrate WebSocket server

#### Frontend Hooks

- **`FrontEnd/src/hooks/useSocket.js`** - Socket.io connection management
- **`FrontEnd/src/hooks/useChat.js`** - Message handling with Firestore sync

#### Frontend Components

- **`FrontEnd/src/components/Chat/ChatWindow.jsx`** - Main chat interface
- **`FrontEnd/src/components/Chat/ChatWindow.css`** - Chat styling

---

## Features

### ✅ Real-Time Features

- **Instant messaging** via Socket.io
- **Typing indicators** (ephemeral, not stored)
- **Online/offline presence** tracking
- **Read receipts** (✓ = sent, ✓✓ = read)
- **Message delivery status**

### ✅ Persistence Features

- **Firestore storage** for all messages
- **Offline sync** - messages stored locally and synced when online
- **Message history** loaded from Firestore on app start
- **Cross-device sync** - see messages on all devices

### ✅ Security Features

- **Firebase token authentication** for WebSocket connections
- **User verification** on every socket connection
- **Authorization checks** before sending messages

---

## Firestore Structure

### Collections

#### `conversations`

```javascript
{
  conversationId: "user1_user2",
  participants: ["userId1", "userId2"],
  lastMessageTime: Timestamp,
  lastMessage: "Last message text...",
  unreadCount: {
    userId1: 0,
    userId2: 2
  }
}
```

#### `conversations/{conversationId}/messages`

```javascript
{
  messageId: "auto-generated",
  senderId: "userId1",
  receiverId: "userId2",
  content: "Message text",
  timestamp: Timestamp,
  readBy: ["userId1"], // Array of users who read the message
  conversationId: "user1_user2"
}
```

#### `presence` (for online status)

```javascript
{
  userId: "user123",
  online: true,
  lastSeen: Timestamp
}
```

---

## Setup Instructions

### 1. Start the Backend Server

```bash
cd BackEnd
npm start
```

You should see:

```
✅ Socket.io server initialized
🚀 Server running on http://localhost:5000
🔌 WebSocket server ready for connections
```

### 2. Start the Frontend

```bash
cd FrontEnd
npm run dev
```

### 3. Test the Messaging System

1. **Login** with a Firebase authenticated user
2. Navigate to **Messages** in the sidebar
3. Select a conversation or start a new one
4. Send a test message
5. Open another browser/tab with a different user
6. Watch messages appear **instantly** via Socket.io

---

## Using the Chat System

### In Your Components

```jsx
import ChatWindow from "../components/Chat/ChatWindow";

function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div>
      {selectedChat && (
        <ChatWindow
          conversationId={selectedChat.id}
          receiverId={selectedChat.otherUserId}
          receiverName={selectedChat.name}
          receiverPhoto={selectedChat.photo}
        />
      )}
    </div>
  );
}
```

### Creating a Conversation

To start a new conversation, you need to create a document in Firestore:

```javascript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../config/firebase";

async function startConversation(otherUserId) {
  const currentUserId = auth.currentUser.uid;

  // Create conversation ID (sorted to ensure consistency)
  const conversationId = [currentUserId, otherUserId].sort().join("_");

  const conversationsRef = collection(db, "conversations");

  await addDoc(conversationsRef, {
    conversationId,
    participants: [currentUserId, otherUserId],
    lastMessageTime: serverTimestamp(),
    lastMessage: "",
    unreadCount: {
      [currentUserId]: 0,
      [otherUserId]: 0,
    },
  });

  return conversationId;
}
```

---

## Socket.io Events Reference

### Client → Server

| Event                | Data                                      | Description                      |
| -------------------- | ----------------------------------------- | -------------------------------- |
| `connection`         | `{ auth: { token } }`                     | Authenticate with Firebase token |
| `message:send`       | `{ conversationId, receiverId, content }` | Send a message                   |
| `typing:start`       | `{ conversationId }`                      | User started typing              |
| `typing:stop`        | `{ conversationId }`                      | User stopped typing              |
| `message:read`       | `{ conversationId, messageIds }`          | Mark messages as read            |
| `conversation:join`  | `conversationId`                          | Join a conversation room         |
| `conversation:leave` | `conversationId`                          | Leave a conversation room        |

### Server → Client

| Event             | Data                                     | Description                |
| ----------------- | ---------------------------------------- | -------------------------- |
| `connect`         | -                                        | Successfully connected     |
| `disconnect`      | `reason`                                 | Disconnected from server   |
| `message:new`     | `{ message, conversation }`              | New message received       |
| `typing:start`    | `{ userId, username, conversationId }`   | Someone is typing          |
| `typing:stop`     | `{ userId, conversationId }`             | Someone stopped typing     |
| `message:read`    | `{ messageIds, userId, conversationId }` | Messages were read         |
| `presence:update` | `{ userId, status }`                     | User online/offline status |
| `error`           | `{ message }`                            | Error occurred             |

---

## Troubleshooting

### Messages not appearing?

1. **Check Socket.io connection**

   - Open browser console (F12)
   - Look for "✅ Socket.io connected" message
   - If disconnected, check backend is running

2. **Check Firebase Authentication**

   - Ensure user is logged in: `auth.currentUser`
   - Check token is valid: `await user.getIdToken()`

3. **Check Firestore permissions**
   - Ensure Firestore rules allow read/write for authenticated users

### Typing indicators not working?

- Typing indicators are ephemeral (Socket.io only)
- Both users must be **online** and **connected**
- Check that both users have joined the conversation room

### Read receipts not updating?

- Read receipts require Firestore update
- Check that `markAsRead()` is being called
- Verify Firestore `readBy` array is updating

---

## Next Steps

### 1. Add FCM Push Notifications

To enable push notifications for offline users:

1. Get FCM server key from Firebase Console
2. Store user FCM tokens in Firestore when they log in
3. Backend `socketServer.js` already has `sendPushNotification()` function ready

Example:

```javascript
// In your login component
import { getToken } from "firebase/messaging";

const token = await getToken(messaging, {
  vapidKey: "YOUR_VAPID_KEY",
});

// Store token in Firestore
await setDoc(
  doc(db, "users", userId),
  {
    fcmToken: token,
  },
  { merge: true }
);
```

### 2. Add Media Support

Extend the system to support images, videos, and files:

- Upload files to Firebase Storage
- Store media URLs in message documents
- Display media in ChatWindow component

### 3. Add Voice/Video Calls

Integrate WebRTC for voice and video calls:

- Use Socket.io for signaling
- WebRTC for peer-to-peer connection
- Display call UI in ChatWindow

### 4. Add Group Chats

Modify the system for group conversations:

- Change `participants` array to support multiple users
- Update Socket.io rooms to broadcast to all participants
- Add group management UI

---

## Cost Optimization

### Socket.io (Free)

- Handles all **live** message traffic
- No cost for real-time delivery
- Reduces Firestore read/write operations

### Firestore (Usage-based)

- Only stores messages (not ephemeral data like typing)
- Real-time listeners are efficient
- Offline persistence included

### FCM (Free)

- Unlimited push notifications
- No cost for delivery

**Estimated Savings**: This hybrid approach can save **60-80%** on Firestore costs compared to using Firestore alone for real-time messaging.

---

## Support

For questions or issues:

1. Check browser console for errors
2. Check backend logs for connection issues
3. Verify Firestore rules and data structure
4. Test with two different browsers/devices

**Happy Messaging! 🚀**
