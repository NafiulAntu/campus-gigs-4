import React, { useState, useEffect, useRef } from "react";
import { auth } from "../../../config/firebase";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
      const response = await axios.get(`${API_URL}/notifications?limit=50`, {
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
      'sup': 'liked your post',
      'repost': 'shared your post',
      'comment': 'commented on your post',
      'message': 'sent you a message',
      'accept': 'accepted your request',
      'reject': 'rejected your application',
      'follow': 'started following you',
      'job_alert': 'posted a new job'
    };
    return actions[type] || message;
  };

  const getIcon = (type) => {
    const icons = {
      'sup': '👍',
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
      'sup': 'text-[#89CFF0]',
      'repost': 'text-[#89CFF0]',
      'comment': 'text-[#89CFF0]',
      'send': 'text-[#89CFF0]',
      'message': 'text-[#89CFF0]',
      'accept': 'text-green-400',
      'reject': 'text-rose-400',
      'follow': 'text-purple-400',
      'job_alert': 'text-blue-400'
    };
    return colors[type] || 'text-[#89CFF0]';
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
      read: false,
      icon: "fi fi-br-refresh",
      color: "text-[#89CFF0]",
    },
    {
      id: 3,
      type: "send",
      user: "Mike Johnson",
      action: "sent your post",
      time: "3h ago",
      read: true,
      icon: "fi fi-br-paper-plane",
      color: "text-[#89CFF0]",
    },
    {
      id: 4,
      type: "accept",
      user: "Emma Wilson",
      action: "accepted your request",
      content: "Your application has been accepted!",
      time: "5h ago",
      read: true,
      icon: "fa-solid fa-check",
      color: "text-green-400",
    },
    {
      id: 5,
      type: "reject",
      user: "TechCorp",
      action: "rejected your application",
      content: "We'll keep your profile for future opportunities",
      time: "1d ago",
      read: true,
      icon: "fa-solid fa-xmark",
      color: "text-rose-400",
    },
  ];

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
            <button className="text-sm text-primary-teal hover:text-primary-blue font-semibold transition-colors">
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
            <button 
              onClick={markAllAsRead}
              className="text-sm text-primary-teal hover:text-primary-blue font-semibold transition-colors"
            >
              Mark all as read
            </button>
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
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-xl transition-colors cursor-pointer ${
                  !notif.read
                    ? "bg-white/[0.08] hover:bg-white/[0.12]"
        {/* Notifications List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary-teal border-t-transparent rounded-full mx-auto"></div>
              <p className="text-text-muted mt-4">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length > 0 ? (
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`h-10 w-10 rounded-full bg-white/[0.04] flex items-center justify-center ${notif.color}`}
                  >
                    {notif.type === "sup" ? (
                      <span className="text-lg" style={{ filter: 'sepia(1) saturate(5) hue-rotate(160deg) brightness(1.1)' }}>{notif.icon}</span>
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
                      onClick={() => setOpenMenuId(openMenuId === notif.id ? null : notif.id)}
                      className="h-8 w-8 rounded-full hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                    >
                      <i className="fi fi-br-menu-dots"></i>
                    </button>
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
                  </div>  onClick={() => handleMenuAction("turnoff", notif.id)}
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
