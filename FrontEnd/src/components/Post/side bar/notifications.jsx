import React, { useState, useEffect, useRef } from "react";

export default function Notifications({ onBack }) {
  const [filter, setFilter] = useState("all");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
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

  const handleMenuAction = (action, notifId) => {
    // Handle notification actions (delete, mute, etc.)
    setOpenMenuId(null);
  };

  const handleSettingsAction = (setting) => {
    // Handle notification settings toggle
    setShowSettingsMenu(false);
  };

  const notifications = [
    {
      id: 1,
      type: "sup",
      user: "John Doe",
      action: "said sup to your post",
      time: "5m ago",
      read: false,
      icon: "🤙",
      color: "text-[#89CFF0]",
    },
    {
      id: 2,
      type: "repost",
      user: "Sarah Smith",
      action: "reposted your post",
      content: "Great work! This is exactly what I was looking for.",
      time: "1h ago",
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
              { key: "reject", label: "Rejects", icon: "fa-solid fa-xmark" },
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
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
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

                    {/* Dropdown Menu */}
                    {openMenuId === notif.id && (
                      <div className="absolute left-full top-[-14px] ml-6 w-50 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                        <button
                          onClick={() => handleMenuAction("report", notif.id)}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-flag text-sm"></i>
                          <span className="text-sm">Report</span>
                        </button>
                        <button
                          onClick={() => handleMenuAction("delete", notif.id)}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-trash text-sm"></i>
                          <span className="text-sm">Delete</span>
                        </button>
                        <button
                          onClick={() => handleMenuAction("turnoff", notif.id)}
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
