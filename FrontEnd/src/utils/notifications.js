/**
 * Browser notification utilities for messaging
 */

/**
 * Request notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

/**
 * Show a notification for a new message
 */
export const showMessageNotification = (senderName, messageText, conversationId) => {
  if (Notification.permission !== 'granted') {
    return;
  }

  const notification = new Notification(`New message from ${senderName}`, {
    body: messageText,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: conversationId,
    requireInteraction: false
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  // Auto close after 5 seconds
  setTimeout(() => notification.close(), 5000);
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
