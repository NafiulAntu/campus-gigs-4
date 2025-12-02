import React, { useState, useEffect, useRef } from "react";
import { auth } from "../../../config/firebase";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Notifications({ onBack }) {
  const [filter, setFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef(null);
  const settingsMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    };

    if (openMenuId || showSettingsMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId, showSettingsMenu]);

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(`${API_URL}/notifications?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const apiNotifications = response.data.data.notifications.map(notif => ({
          id: notif.id,
          type: notif.type,
          user: notif.actor_name || notif.actor_username || notif.actor_full_name || 'Unknown User',
          action: getActionText(notif.type, notif.message),
          content: notif.data?.commentPreview || notif.data?.messagePreview || null,
          time: formatTimeAgo(notif.created_at),
          read: notif.is_read,
          icon: getIcon(notif.type),
          color: getColor(notif.type),
          link: notif.link
        }));
        setNotifications(apiNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionText = (type, message) => {
    // Extract action from message
    const actions = {
      'sup': 'supped your post',
      'repost': 'shared your post',
      'comment': 'commented on your post',
      'message': 'sent you a message',
      'accept': 'accepted your request',
      'reject': 'rejected your request',
      'follow': 'started following you',
      'job_alert': 'posted a new job'
    };
    return actions[type] || message;
  };

  const getIcon = (type) => {
    const icons = {
      'sup': '🤙',
      'repost': 'fi fi-br-refresh',
      'comment': '💬',
      'send': 'fi fi-br-paper-plane',
      'message': '💬',
      'accept': 'fa-solid fa-check',
      'reject': 'fa-solid fa-xmark',
      'follow': 'fa-solid fa-user-plus',
      'job_alert': 'fa-solid fa-briefcase'
    };
    return icons[type] || 'fi fi-br-bell';
  };

  const getColor = (type) => {
    const colors = {
      'sup': 'text-[#3b82f6]',
      'repost': 'text-[#3b82f6]',
      'comment': 'text-[#3b82f6]',
      'send': 'text-[#3b82f6]',
      'message': 'text-[#3b82f6]',
      'accept': 'text-[#3b82f6]',
      'reject': 'text-[#3b82f6]',
      'follow': 'text-[#3b82f6]',
      'job_alert': 'text-[#3b82f6]'
    };
    return colors[type] || 'text-[#3b82f6]';
  };

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

  const handleMenuAction = async (action, notifId) => {
    if (action === 'delete') {
      try {
        const token = await auth.currentUser?.getIdToken();
        await axios.delete(`${API_URL}/notifications/${notifId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.filter(n => n.id !== notifId));
      } catch (error) {
        console.error('Error deleting notification:', error);
      }
    }
    setOpenMenuId(null);
  };

  const markAllAsRead = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      await axios.put(`${API_URL}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notif) => {
    // Mark as read
    if (!notif.read) {
      try {
        const token = await auth.currentUser?.getIdToken();
        await axios.put(`${API_URL}/notifications/${notif.id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => 
          n.id === notif.id ? { ...n, read: true } : n
        ));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
    
    // Navigate to link if exists
    if (notif.link) {
      window.location.href = notif.link;
    }
  };

  const handleSettingsAction = (setting) => {
    // Handle notification settings toggle
    setShowSettingsMenu(false);
  };

  const filteredNotifications =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.type === filter);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto py-6 px-4 lg:px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="h-9 w-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <i className="fi fi-br-arrow-left text-white text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-white">Notifications</h1>
            </div>
            <button 
              onClick={markAllAsRead}
              className="text-sm text-primary-teal hover:text-primary-blue font-semibold transition-colors"
            >
              Mark all as read
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-6 overflow-x-auto pb-2">
            {[
              { key: "all", label: "All", icon: "fi fi-br-apps" },
              { key: "sup", label: "Sup", icon: "🤙" },
              { key: "repost", label: "Reposts", icon: "fi fi-br-refresh" },
              { key: "accept", label: "Accepts", icon: "fa-solid fa-check" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  filter === tab.key
                    ? "text-[#89CFF0]"
                    : "text-text-muted hover:text-white"
                }`}
              >
                {tab.key === "sup" ? (
                  <span className="text-sm" style={{ filter: filter === tab.key ? 'sepia(1) saturate(5) hue-rotate(160deg) brightness(1.1)' : 'grayscale(1)' }}>{tab.icon}</span>
                ) : (
                  <i className={`${tab.icon} text-sm`}></i>
                )}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary-teal border-t-transparent rounded-full mx-auto"></div>
              <p className="text-text-muted mt-4">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 rounded-xl transition-colors cursor-pointer ${
                  !notif.read
                    ? "bg-white/[0.08] hover:bg-white/[0.12]"
                    : "bg-white/[0.04] hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`h-10 w-10 rounded-full bg-white/[0.04] flex items-center justify-center ${notif.color}`}
                  >
                    {notif.type === "sup" || notif.type === "comment" || notif.type === "message" ? (
                      <span className="text-lg">{notif.icon}</span>
                    ) : (
                      <i className={`${notif.icon} text-lg`}></i>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-white">
                        <span className="font-semibold">{notif.user}</span>{" "}
                        <span className="text-text-muted">{notif.action}</span>
                      </p>
                      {!notif.read && (
                        <span className="h-2 w-2 bg-primary-teal rounded-full mt-2"></span>
                      )}
                    </div>
                    {notif.content && (
                      <p className="text-sm text-text-muted mb-2">
                        {notif.content}
                      </p>
                    )}
                    <p className="text-xs text-text-muted">{notif.time}</p>
                  </div>

                  {/* Actions */}
                  <div className="relative" ref={openMenuId === notif.id ? menuRef : null}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === notif.id ? null : notif.id);
                      }}
                      className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                    >
                      <i className="fi fi-br-menu-dots"></i>
                    </button>

                    {openMenuId === notif.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] rounded-lg shadow-xl border border-white/10 overflow-hidden z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuAction("delete", notif.id);
                          }}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-trash text-sm"></i>
                          <span className="text-sm">Delete</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMenuAction("turnoff", notif.id);
                          }}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-bell-slash text-sm"></i>
                          <span className="text-sm">Turn off</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-white/[0.04] flex items-center justify-center">
                <i className="fi fi-br-bell text-4xl text-text-muted"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No notifications
              </h3>
              <p className="text-text-muted">
                You're all caught up! Check back later for new updates.
              </p>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="mt-8 p-6 bg-white/[0.04] rounded-xl">
          <h2 className="text-lg font-semibold text-white mb-4">
            Notification Settings
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Push Notifications",
                desc: "Receive push notifications on your device",
              },
              { label: "Email Notifications", desc: "Get notified via email" },
              { label: "SMS Notifications", desc: "Receive SMS alerts" },
              { label: "Job Alerts", desc: "Notify me about new job postings" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="font-medium text-white">{item.label}</p>
                  <p className="text-sm text-text-muted">{item.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-teal"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
