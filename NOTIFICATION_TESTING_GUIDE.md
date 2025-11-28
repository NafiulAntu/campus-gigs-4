# Notification System Testing Guide

## 🎯 Current Status

✅ **Backend**: Running on port 5000 with notification routes enabled
✅ **Database**: Tables created (notifications, notification_preferences, fcm_tokens)
✅ **Socket.io**: Real-time notification delivery configured
✅ **UI**: NotificationBell component added to Header
✅ **Triggers**: Like and Share actions now send notifications

## 🧪 How to Test

### 1. Test Real-time Notifications (Socket.io)

**Setup:**
1. Open the app in browser (http://localhost:3000)
2. Login with a user account
3. Open browser console to see notification logs

**Test Like Notification:**
1. Create a post with User A
2. Login as User B in another browser/incognito
3. Like User A's post
4. User A should see:
   - NotificationBell badge count increase
   - Real-time notification appear in dropdown
   - Console log: "✅ New notification received via Socket.io"

**Test Share Notification:**
1. Share User A's post as User B
2. User A should see share notification

### 2. Test Notification Bell UI

**Features to test:**
- Click bell icon → dropdown opens
- Badge shows unread count
- Notifications list displays recent items
- Click "Mark all as read" → badge clears
- Click individual notification → mark as read
- Delete button removes notification

### 3. Test API Endpoints (Using Postman or curl)

**Get Notifications:**
```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get Unread Count:**
```bash
curl -X GET http://localhost:5000/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Mark as Read:**
```bash
curl -X PUT http://localhost:5000/api/notifications/1/read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Mark All as Read:**
```bash
curl -X PUT http://localhost:5000/api/notifications/mark-all-read \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Delete Notification:**
```bash
curl -X DELETE http://localhost:5000/api/notifications/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Push Notifications (FCM) - TODO

**Requirements:**
1. Get VAPID key from Firebase Console:
   - Go to Firebase Console > Project Settings
   - Navigate to Cloud Messaging
   - Under "Web Push certificates", generate new key pair
   - Copy the VAPID key

2. Update `FrontEnd/src/config/firebase.js`:
   ```javascript
   export const VAPID_KEY = "YOUR_ACTUAL_VAPID_KEY";
   ```

3. Test push notifications:
   - Grant notification permission when prompted
   - FCM token should be saved to backend
   - Background notifications should work when tab is closed

## 🔧 Current Implementation

### Notification Types
- `sup` - Someone liked your post ❤️
- `repost` - Someone shared your post 🔁
- `send` - Someone sent you content 📤
- `message` - New message received 💬
- `accept` - Job application accepted ✅
- `reject` - Job application rejected ❌
- `job_alert` - New job posted 🔔
- `follow` - Someone followed you 👥

### Active Triggers
✅ **Like Post** → `notifySup()` in `postController.js`
✅ **Share Post** → `notifyRepost()` in `postController.js`

### Pending Triggers
⏳ Message actions → `notifyMessage()`, `notifySend()`
⏳ Job applications → `notifyJobAccept()`, `notifyJobReject()`, `notifyJobAlert()`
⏳ Follow actions → `notifyFollow()`

## 📋 Next Steps

1. **Get VAPID Key** from Firebase Console and update `firebase.js`
2. **Test Like/Share** notifications with two user accounts
3. **Add notification preferences** UI for users to customize
4. **Add more triggers**:
   - Message received
   - Job application status
   - New follower
   - Comment on post
5. **Add notification history** page to view all notifications
6. **Add email notifications** for important events

## 🐛 Troubleshooting

**Backend not starting:**
- Check if port 5000 is in use: `netstat -ano | findstr :5000`
- Kill process: `taskkill //F //PID <PID>`
- Restart: `cd BackEnd && npm start`

**Notifications not appearing:**
- Check browser console for errors
- Verify Socket.io connection in Network tab
- Check backend logs for notification creation
- Verify user is logged in with valid token

**FCM not working:**
- Ensure VAPID_KEY is set correctly
- Check service worker is registered
- Grant notification permission
- Check backend has firebase-admin properly configured

## 📊 Database Queries

**View all notifications:**
```sql
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

**Count unread notifications per user:**
```sql
SELECT user_id, COUNT(*) as unread_count 
FROM notifications 
WHERE is_read = false 
GROUP BY user_id;
```

**View notification preferences:**
```sql
SELECT * FROM notification_preferences;
```

**View FCM tokens:**
```sql
SELECT user_id, device, created_at FROM fcm_tokens;
```

## ✨ Features Summary

### Backend
- ✅ RESTful API with 9 endpoints
- ✅ Socket.io real-time delivery
- ✅ PostgreSQL storage with indexes
- ✅ Notification preferences per type
- ✅ FCM token management
- ✅ Automatic cleanup of old notifications (90 days)

### Frontend
- ✅ NotificationBell component with badge
- ✅ Dropdown with notification list
- ✅ Real-time updates via Socket.io
- ✅ Mark as read/delete actions
- ⏳ Push notification support (needs VAPID key)
- ⏳ Notification settings page

### Integration
- ✅ Like post → notification
- ✅ Share post → notification
- ⏳ Message received → notification
- ⏳ Job status → notification
- ⏳ Follow user → notification
