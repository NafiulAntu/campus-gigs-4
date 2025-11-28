# Notification System - Quick Reference

## 🚀 Testing Checklist (Use This!)

### 1. Start Backend
```bash
cd /s/C-Gigs-React/Campus/BackEnd
npm start
```
**Expected:**
```
✅ Firebase Admin SDK initialized (Auth only)
🚀 Server running on http://localhost:5000
PostgreSQL Connected Successfully
✅ Database connected: PG Antu
```

---

### 2. Login Two Users
- Open two browser tabs
- Login as User A (Tab 1)
- Login as User B (Tab 2)

**Check Console (F12) in BOTH tabs:**
```
✅ Socket.io connected: <socket-id>
✅ NotificationBell: Socket listeners registered
```

---

### 3. Test Like Notification

**User A:** Create a post  
**User B:** Click like button

**User B Backend Terminal:**
```
👍 toggleLike: postId=..., userId=...
📊 Post info: posted_by=..., liked=true
🔔 Sending like notification: from userId=... to userId=...
📝 Creating notification: userId=..., actorId=..., type=sup
✅ Notification created in DB: ID=...
📡 Emitting to Socket.io room: user_...
✅ Notification emitted to room user_...
```

**User A Console (Tab 1):**
```
📬 New notification received via Socket.io: { id: ..., type: 'sup', ... }
```

**User A Screen:**
- 🔴 Red badge on bell icon
- Notification: "UserB liked your post"

✅ **SUCCESS!** If you see this, notifications work!

---

### 4. Test Share Notification

**User A:** Create a post  
**User B:** Click share button

**Backend logs same as like, but with:**
```
🔄 toggleShare
type=repost
"UserB shared your post"
```

---

## 🐛 Quick Debug

### No Socket connection?
```bash
# Check debug endpoint
curl http://localhost:5000/api/debug/socket-rooms
```

Should show:
```json
{
  "connectedSockets": 2,
  "sockets": [
    { "pgUserId": 123, "rooms": ["user_123", ...] },
    { "pgUserId": 456, "rooms": ["user_456", ...] }
  ]
}
```

### Notification created but not received?

**Check:**
1. PostgreSQL ID in rooms? → Debug endpoint shows `user_{number}`
2. Frontend listening? → Console shows "Socket listeners registered"
3. Backend emitting? → Terminal shows "Notification emitted to room user_X"

### Still not working?

**Run these SQL queries:**
```sql
-- Check notifications in database
SELECT id, user_id, actor_id, type, title, created_at
FROM notifications
ORDER BY created_at DESC LIMIT 5;

-- Check Firebase UID mapping
SELECT id, username, firebase_uid
FROM users
WHERE id IN (123, 456); -- Replace with your user IDs
```

---

## 📝 Key Points

1. **Two users required** - Can't test with same user
2. **Check BOTH console and terminal** - Need both to debug
3. **PostgreSQL ID ≠ Firebase UID** - They're different, that's normal
4. **Self-notifications blocked** - You can't notify yourself
5. **Offline notifications saved** - Stored in DB, fetched on login

---

## 🎯 What's Working

✅ Like notifications  
✅ Share notifications  
✅ Message notifications  
✅ Real-time delivery  
✅ Database persistence  
✅ Unread count  
✅ Mark as read  
✅ Delete notifications  

---

## 🔗 Documentation

- **NOTIFICATION_DEBUG_GUIDE.md** - Full testing guide
- **NOTIFICATION_SYSTEM_PRO.md** - Complete implementation details
- **Debug Endpoint:** `GET http://localhost:5000/api/debug/socket-rooms`

---

## 🆘 Emergency Commands

**Restart Backend:**
```bash
# Find and kill process
netstat -ano | findstr :5000
taskkill //F //PID <PID>

# Start again
cd /s/C-Gigs-React/Campus/BackEnd && npm start
```

**Check Database:**
```sql
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
SELECT id, username, firebase_uid FROM users;
```

**Check Logs:**
- Backend: Terminal running `npm start`
- Frontend: Browser Console (F12)
- Socket Status: `http://localhost:5000/api/debug/socket-rooms`

---

## ✅ Success = See This

**Backend Terminal:**
```
✅ Mapped Firebase UID to PostgreSQL ID: uid -> 123
📡 User joined notification room: user_123
🔔 Sending like notification: from userId=456 to userId=123
📝 Creating notification: userId=123, actorId=456, type=sup
✅ Notification created in DB: ID=789
📡 Emitting to Socket.io room: user_123
✅ Notification emitted to room user_123
```

**Frontend Console:**
```
✅ Socket.io connected: abc123
✅ NotificationBell: Socket listeners registered
📬 New notification received via Socket.io: { id: 789, type: 'sup', ... }
```

**UI:**
- 🔴 Red badge with count
- 🔔 Dropdown shows notification
- 📱 Browser notification (if allowed)

---

**That's it! If you see all this, your notification system is working like a PRO! 🚀**
