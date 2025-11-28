import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { auth } from '../../config/firebase';
import axios from 'axios';
import './NotificationBell.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const { socket, isConnected } = useSocket();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(`${API_URL}/notifications?limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.put(`${API_URL}/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.put(`${API_URL}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.delete(`${API_URL}/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate to link if provided
    if (notification.link) {
      window.location.href = notification.link;
    }

    setShowDropdown(false);
  };

  // Socket.io real-time listeners
  useEffect(() => {
    console.log('🔍 NotificationBell: Socket state check', { 
      socketExists: !!socket, 
      isConnected,
      socketId: socket?.id 
    });

    if (!socket || !isConnected) {
      console.warn('⚠️ NotificationBell: Socket not ready, skipping listener setup');
      return;
    }

    console.log('✅ NotificationBell: Setting up Socket.io listeners on socket:', socket.id);

    // New notification received
    socket.on('notification:new', (notification) => {
      console.log('📬 New notification received via Socket.io:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/logo192.png',
          tag: notification.id
        });
      }
    });

    // Notification marked as read
    socket.on('notification:read', ({ notificationId }) => {
      console.log('✅ Notification marked as read:', notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    });

    // All notifications marked as read
    socket.on('notification:all_read', () => {
      console.log('✅ All notifications marked as read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    });

    console.log('✅ NotificationBell: Socket listeners registered');

    return () => {
      console.log('🧹 NotificationBell: Cleaning up Socket listeners');
      socket.off('notification:new');
      socket.off('notification:read');
      socket.off('notification:all_read');
    };
  }, [socket, isConnected]);

  // Initial fetch
  useEffect(() => {
    if (auth.currentUser) {
      fetchNotifications();
    }
  }, []);

  // Fetch unread count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (auth.currentUser && !showDropdown) {
        fetchUnreadCount();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [showDropdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const icons = {
      sup: '👍',
      repost: '🔄',
      send: '📤',
      comment: '💬',
      message: '💬',
      accept: '✅',
      reject: '❌',
      job_alert: '💼',
      follow: '👤'
    };
    return icons[type] || '🔔';
  };

  // Format time ago
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        className="notification-bell-button"
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) {
            fetchNotifications();
          }
        }}
      >
        <i className="fi fi-br-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-read-btn">
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <i className="fi fi-br-bell text-4xl text-gray-400"></i>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.is_read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-title">
                      <strong>{notif.actor_name || notif.actor_username || notif.actor_full_name || 'Someone'}</strong>
                    </p>
                    <p className="notification-message">{notif.message}</p>
                    <span className="notification-time">{formatTimeAgo(notif.created_at)}</span>
                  </div>
                  {!notif.is_read && <span className="notification-dot"></span>}
                  <button
                    className="notification-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                  >
                    <i className="fi fi-br-cross"></i>
                  </button>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button onClick={() => window.location.href = '/notifications'}>
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
