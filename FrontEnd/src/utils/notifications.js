/**
 * Browser notification utilities for messaging and push notifications
 */

import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app, VAPID_KEY } from '../config/firebase';
import axios from 'axios';

/**
 * Register service worker for push notifications
 */
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
};

/**
 * Request notification permission and get FCM token
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    await setupFCMToken();
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await setupFCMToken();
      return true;
    }
  }

  return false;
};

/**
 * Setup FCM token and save to backend
 */
const setupFCMToken = async () => {
  try {
    // Register service worker first
    await registerServiceWorker();
    
    const messaging = getMessaging(app);
    
    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY
    });
    
    if (token) {
      console.log('✅ FCM Token:', token);
      
      // Save token to backend
      const authToken = localStorage.getItem('token');
      if (authToken) {
        await axios.post('http://localhost:5000/api/notifications/fcm-token', 
          { fcmToken: token, device: navigator.userAgent },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log('✅ FCM token saved to backend');
      }
      
      // Listen for foreground messages
      onMessage(messaging, (payload) => {
        console.log('📬 Foreground message:', payload);
        
        if (payload.notification) {
          showNotification(
            payload.notification.title,
            payload.notification.body,
            payload.data
          );
        }
      });
    }
  } catch (error) {
    console.error('❌ Error setting up FCM:', error);
  }
};

/**
 * Show a notification
 */
export const showNotification = (title, body, data = {}) => {
  if (Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: data.id || 'notification',
    requireInteraction: false,
    data
  });

  notification.onclick = () => {
    window.focus();
    
    // Handle notification click based on type
    if (data.url) {
      window.location.href = data.url;
    }
    
    notification.close();
  };

  // Auto close after 5 seconds
  setTimeout(() => notification.close(), 5000);
};

/**
 * Show a notification for a new message
 */
export const showMessageNotification = (senderName, messageText, conversationId) => {
  showNotification(
    `New message from ${senderName}`,
    messageText,
    { conversationId, type: 'message' }
  );
};

/**
 * Play notification sound
 */
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Could not play notification sound:', err));
  } catch (error) {
    console.log('Notification sound not available');
  }
};
