# Notification System - Debug & Testing Guide

## 🔧 What Was Fixed

### Critical Issues Resolved:
1. **Socket.io Room Mismatch**: Users were joining rooms with Firebase UID, but notifications were sent to PostgreSQL user ID rooms
2. **Missing Room Joining**: Users now properly join `user_{pgUserId}` room on connection
3. **Enhanced Logging**: Complete notification flow tracking from trigger to delivery
4. **Debug Endpoint**: Added `/api/debug/socket-rooms` to inspect active connections

### Changes Made:

#### Backend (socketServer.js)
- On connection, fetch PostgreSQL user ID from Firebase UID
- Join both `user:{firebaseUid}` (messages) and `user_{pgUserId}` (notifications) rooms
- Log room joining with PostgreSQL ID mapping

#### Backend (simpleNotificationHelpers.js)
- Enhanced logging shows: userId, actorId, type, room name, emit confirmation
- Tracks notification creation → database insert → Socket.io emit

#### Backend (postController.js)
- Added detailed logs for like/share actions
- Shows: postId, userId, posted_by, liked/shared status, notification trigger

#### Frontend (NotificationBell.jsx)
- Enhanced Socket connection logging
- Shows: socket existence, connection state, socket ID
- Logs when listeners are registered and events received

---

## 🧪 Testing the Notification System

### Prerequisites:
1. ✅ Backend server running on port 5000
2. ✅ Frontend running on port 3000
3. ✅ Two user accounts for testing (User A and User B)
4. ✅ Both users logged in on different browser tabs/windows

### Test 1: Check Socket.io Connection

**Open Browser Console (F12) on BOTH users:**

Expected logs:
```
✅ Socket.io connected: <socket-id>
🔍 NotificationBell: Socket state check { socketExists: true, isConnected: true, socketId: '<id>' }
✅ NotificationBell: Setting up Socket.io listeners on socket: <socket-id>
✅ NotificationBell: Socket listeners registered
```

**If you don't see these logs:**
- Check network tab for Socket.io connection
- Verify Firebase auth token is valid
- Check backend terminal for authentication errors

---

### Test 2: Verify Room Joining

**Backend Terminal Should Show (when users connect):**
```
✅ Socket authenticated: user@example.com (firebase-uid)
🔌 Socket connected: <socket-id> (Firebase UID: firebase-uid)
✅ Mapped Firebase UID to PostgreSQL ID: firebase-uid -> 123
📡 User joined notification room: user_123
```

**To manually verify rooms:**
```bash
curl http://localhost:5000/api/debug/socket-rooms
```

Expected response:
```json
{
  "connectedSockets": 2,
  "sockets": [
    {
      "id": "socket-id-1",
      "firebaseUid": "firebase-uid-1",
      "pgUserId": 123,
      "rooms": ["socket-id-1", "user:firebase-uid-1", "user_123"]
    },
    {
      "id": "socket-id-2",
      "firebaseUid": "firebase-uid-2",
      "pgUserId": 456,
      "rooms": ["socket-id-2", "user:firebase-uid-2", "user_456"]
    }
  ]
}
```

**Check that:**
- Each socket has `pgUserId` (PostgreSQL ID)
- Each socket is in `user_{pgUserId}` room
- Room name matches PostgreSQL user ID from database

---

### Test 3: Like Notification Flow

**User A:** Create a post  
**User B:** Like User A's post

**User B's Backend Terminal (when clicking like):**
```
👍 toggleLike: postId=<post-id>, userId=456
📊 Post info: posted_by=123, liked=true, isOwnPost=false
🔔 Sending like notification: from userId=456 (UserB) to userId=123
📝 Creating notification: userId=123, actorId=456, type=sup
✅ Notification created in DB: ID=789
📡 Emitting to Socket.io room: user_123
✅ Notification emitted to room user_123
✅ Like notification sent successfully
```

**User A's Frontend Console (real-time):**
```
📬 New notification received via Socket.io: { id: 789, type: 'sup', title: 'UserB liked your post', ... }
```

**User A's Screen:**
- Notification bell shows red badge with count
- Dropdown shows "UserB liked your post"

---

### Test 4: Share Notification Flow

**User A:** Create a post  
**User B:** Share User A's post

**User B's Backend Terminal:**
```
🔄 toggleShare: postId=<post-id>, userId=456
📊 Post info: posted_by=123, shared=true, isOwnPost=false
🔔 Sending share notification: from userId=456 (UserB) to userId=123
📝 Creating notification: userId=123, actorId=456, type=repost
✅ Notification created in DB: ID=790
📡 Emitting to Socket.io room: user_123
✅ Notification emitted to room user_123
✅ Share notification sent successfully
```

**User A's Frontend Console:**
```
📬 New notification received via Socket.io: { id: 790, type: 'repost', title: 'UserB shared your post', ... }
```

---

### Test 5: Message Notification Flow

**User A:** Send message to User B in chat

**Backend Terminal:**
```
💬 Message from firebase-uid-a to conversation conv-id
SELECT id, username, full_name FROM users WHERE firebase_uid = $1
SELECT id FROM users WHERE firebase_uid = $1
📝 Creating notification: userId=456, actorId=123, type=message
✅ Notification created in DB: ID=791
📡 Emitting to Socket.io room: user_456
✅ Notification emitted to room user_456
✅ Message notification sent to user: 456
```

**User B's Frontend Console:**
```
📬 New notification received via Socket.io: { id: 791, type: 'message', title: 'New message from UserA', ... }
```

---

## 🐛 Troubleshooting

### Issue: No Socket connection logs in console

**Solution:**
1. Check if user is logged in (auth.currentUser exists)
2. Verify Firebase config in frontend
3. Check backend Socket.io middleware authentication
4. Look for "Socket authentication failed" in backend logs

### Issue: Socket connects but no room joining logs

**Solution:**
1. Check backend terminal for database query errors
2. Verify `firebase_uid` column exists in users table
3. Run query: `SELECT id, firebase_uid FROM users WHERE firebase_uid = '<your-uid>'`
4. If no results, user account may not have firebase_uid set

### Issue: Notification created in DB but not received in frontend

**Solution:**
1. Check `/api/debug/socket-rooms` to see if user is in correct room
2. Backend should emit to `user_{pgUserId}` where pgUserId is PostgreSQL ID
3. Frontend should be listening on 'notification:new' event
4. Check for JavaScript errors in browser console

### Issue: "io is not defined" error in controller

**Solution:**
1. Verify `app.set('io', io)` is in server.js
2. Check that `const io = req.app.get('io')` is in controller
3. Restart backend server

### Issue: PostgreSQL user ID is null

**Solution:**
1. User account doesn't have firebase_uid in database
2. Run migration to add firebase_uid: `node migrations/add_firebase_uid.sql`
3. Or manually update: `UPDATE users SET firebase_uid = '<uid>' WHERE id = <id>`

---

## 📊 Database Verification

### Check if notifications are being created:
```sql
SELECT id, user_id, actor_id, type, title, message, is_read, created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;
```

### Check user Firebase UID mapping:
```sql
SELECT id, username, full_name, firebase_uid
FROM users
WHERE id IN (123, 456); -- Replace with your user IDs
```

### Check post ownership:
```sql
SELECT id, posted_by, content, created_at
FROM posts
WHERE id = '<post-id>'; -- Replace with post UUID
```

---

## ✅ Success Indicators

When everything is working correctly, you should see:

1. **Backend Server Startup:**
   - ✅ Database connected
   - ✅ Firebase Admin SDK initialized
   - ✅ Models synced
   - 🚀 Server running on http://localhost:5000

2. **User Connection:**
   - ✅ Socket authenticated
   - 🔌 Socket connected
   - ✅ Mapped Firebase UID to PostgreSQL ID
   - 📡 User joined notification room

3. **Notification Trigger:**
   - 👍/🔄 Action (toggleLike/toggleShare)
   - 🔔 Sending notification
   - 📝 Creating notification
   - ✅ Notification created in DB
   - 📡 Emitting to Socket.io room
   - ✅ Notification emitted

4. **Frontend Reception:**
   - 📬 New notification received via Socket.io
   - Red badge on notification bell
   - Notification appears in dropdown
   - Browser notification (if permitted)

---

## 🚀 Next Steps

Once basic notifications work:

1. **Add Follow Notifications**
   - Implement in follow/unfollow endpoints
   - Use `notifyFollow()` helper

2. **Add Job Application Notifications**
   - Accept: Use `notifyJobAccept()`
   - Reject: Use `notifyJobReject()`
   - New Job: Use `notifyJobAlert()`

3. **Enhance UI**
   - Add notification icons by type
   - Add "mark all as read" button
   - Add filtering by notification type
   - Add notification preferences

4. **Performance**
   - Add pagination to notification list
   - Implement notification archiving
   - Add notification expiry (auto-delete old ones)

---

## 📝 Important Notes

- **Always test with two different users** (not same user)
- **Use different browser tabs or incognito mode** for each user
- **Check both frontend console AND backend terminal** for logs
- **PostgreSQL user ID ≠ Firebase UID** - they are mapped in users table
- **Notifications sent to offline users** are stored in DB and fetched on login
- **Self-notifications are blocked** (userId === actorId check)

---

## 🔗 Related Files

- Backend Socket Server: `BackEnd/socketServer.js`
- Notification Helpers: `BackEnd/utils/simpleNotificationHelpers.js`
- Post Controller: `BackEnd/controllers/postController.js`
- Notification Routes: `BackEnd/routes/notificationRoutes.js`
- Frontend Component: `FrontEnd/src/components/Notifications/NotificationBell.jsx`
- Socket Hook: `FrontEnd/src/hooks/useSocket.js`
- Debug Endpoint: `GET http://localhost:5000/api/debug/socket-rooms`
