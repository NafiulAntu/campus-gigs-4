import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../../hooks/useSocket";
import { auth } from "../../../config/firebase";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Sidebar({ onNavigate = () => {}, brightOn = false }) {
  const navigate = useNavigate();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const menuRef = useRef(null);
  const { socket, isConnected } = useSocket();

  // Load user data from localStorage
  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    
    loadUser();
    
    // Listen for custom storage events to refresh user data
    const handleStorageChange = () => {
      loadUser();
    };
    
    window.addEventListener('userUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('userUpdated', handleStorageChange);
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    }
    if (showAccountMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAccountMenu]);

  // Fetch notification count (excluding messages)
  const fetchNotificationCount = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      const totalResponse = await axios.get(`${API_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const messageResponse = await axios.get(`${API_URL}/notifications/unread-count?type=message`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (totalResponse.data.success && messageResponse.data.success) {
        const totalCount = totalResponse.data.data.count;
        const msgCount = messageResponse.data.data.count;
        setNotificationCount(totalCount - msgCount);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  //badge
  const getBadgeCount = (count) => {
    return count > 99 ? '99+' : count;
  };

  // Fetch message count using type filter
  const fetchMessageCount = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      
      const response = await axios.get(`${API_URL}/notifications/unread-count?type=message`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMessageCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error fetching message count:', error);
    }
  };

  // Initial fetch and periodic updates
  useEffect(() => {
    if (auth.currentUser) {
      fetchNotificationCount();
      fetchMessageCount();
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchNotificationCount();
        fetchMessageCount();
      }
    });

    // Refresh counts every 30 seconds
    const interval = setInterval(() => {
      if (auth.currentUser) {
        fetchNotificationCount();
        fetchMessageCount();
      }
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Socket.io real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on('notification:new', (notification) => {
      if (notification.type === 'message') {
        setMessageCount(prev => prev + 1);
      } else {
        setNotificationCount(prev => prev + 1);
      }
    });

    socket.on('notification:read', ({ notificationId }) => {
      fetchNotificationCount();
      fetchMessageCount();
    });

    socket.on('notification:all_read', () => {
      setNotificationCount(0);
      setMessageCount(0);
    });

    return () => {
      socket.off('notification:new');
      socket.off('notification:read');
      socket.off('notification:all_read');
    };
  }, [socket, isConnected]);

  // X.com-like nav configuration
  const nav = [
    { key: "home", label: "Home", icon: "fi fi-br-home" },
    { key: "jobs", label: "Explore", icon: "fi fi-br-search" },
    { key: "notifications", label: "Notifications", icon: "fi fi-br-bell" },
    { key: "messages", label: "Messages", icon: "fi fi-br-envelope" },
    { key: "communities", label: "Communities", icon: "fi fi-br-users-alt" },
    { key: "premium", label: "Premium", icon: "fi fi-br-diamond" },
    { key: "payments", label: "Payments", icon: "fi fi-br-wallet" },
    { key: "profile", label: "Profile", icon: "fi fi-br-user" },
  ];

  return (
    <div className={`h-screen flex flex-col justify-between py-1 transition-all duration-300 ${
      brightOn ? 'bg-transparent' : ''
    }`}>
      {/* Brand */}
      <div className="min-h-0">
        <div className="px-3 pt-1 mb-1">
          <div className="text-[26px] font-bold bg-gradient-to-r from-[#14b8a6] to-blue-500 bg-clip-text text-transparent">
            <span className="hidden 2xl:inline">Cam-G</span>
            <span className="inline 2xl:hidden">C</span>
          </div>
          <div className={`mt-0.5 text-xs leading-tight italic hidden 2xl:block transition-colors duration-300 ${
            brightOn ? 'text-gray-600' : 'text-text-muted'
          }`}>
            Connect. Collaborate. Create.
          </div>
        </div>

        {/* Nav */}
        <nav
          className="space-y-1 px-2"
          role="navigation"
          aria-label="Primary"
        >
          {nav.map((it) => (
            <button
              key={it.key}
              onClick={() => {
                // Notify parent first
                onNavigate(it.key);
                // Route actions: send Home to main page
                if (it.key === "home") {
                  navigate("/");
                }
              }}
              className={`group relative w-full text-left px-4 py-3 rounded-full flex items-center 2xl:gap-4 justify-center 2xl:justify-start transition-all duration-200 ${
                brightOn 
                  ? 'text-gray-700 hover:bg-gradient-to-r hover:from-teal-100 hover:to-blue-100 hover:text-teal-700 hover:shadow-md' 
                  : 'hover:bg-white/10 text-white hover:text-primary-teal'
              } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-teal`}
              title={it.label}
            >
              <span className="relative">
                <i
                  className={`${it.icon} text-[26px] transition-all duration-200 group-hover:scale-105 ${
                    brightOn ? 'group-hover:text-teal-600' : 'group-hover:text-primary-teal'
                  }`}
                ></i>
                {/* Show badge for notifications */}
                {it.key === "notifications" && notificationCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white text-[11px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 shadow-lg ring-2 ${
                    brightOn ? 'ring-white' : 'ring-black'
                  }`}>
                    {getBadgeCount(notificationCount)}
                  </span>
                )}
                {/* Show badge for messages */}
                {it.key === "messages" && messageCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-gradient-to-r from-[#4ECDC4] to-[#44A08D] text-white text-[11px] font-semibold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5 shadow-lg ring-2 z-10 ${
                    brightOn ? 'ring-white' : 'ring-black'
                  }`}>
                    {getBadgeCount(messageCount)}
                  </span>
                )}
              </span>
              <span className={`font-bold text-[20px] hidden 2xl:inline transition-colors duration-200`}>
                {it.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Compose / Post button */}
        <div className="mt-4 px-3">
          <button
            onClick={() => {
              // First, navigate to home if not already there
              onNavigate("home");
              
              // Wait for navigation to complete, then scroll to composer
              setTimeout(() => {
                const composer = document.getElementById('post-composer');
                if (composer) {
                  // Smooth scroll to composer
                  composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  
                  // Focus on textarea after scroll completes
                  setTimeout(() => {
                    const textarea = composer.querySelector('textarea');
                    if (textarea) {
                      textarea.focus();
                      // Add a subtle pulse effect to draw attention
                      textarea.style.transition = 'all 0.3s ease';
                      textarea.style.transform = 'scale(1.02)';
                      setTimeout(() => {
                        textarea.style.transform = 'scale(1)';
                      }, 300);
                    }
                  }, 500);
                }
              }, 100);
            }}
            className={`group w-full text-center rounded-full font-bold py-3.5 transition-all duration-300 text-[17px] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 ${
              brightOn
                ? 'bg-gradient-to-r from-[#14b8a6] to-[#3B82F6] hover:from-[#0D9488] hover:to-[#2563EB] text-white shadow-teal-400/40 hover:shadow-teal-500/60'
                : 'bg-gradient-to-r from-primary-teal to-blue-500 hover:from-primary-blue hover:to-primary-teal text-white shadow-primary-teal/30 hover:shadow-primary-teal/50'
            }`}
            title="Create a new post"
          >
            <span className="hidden 2xl:inline">Post</span>
            <i className="fi fi-br-edit inline 2xl:hidden text-[20px] transition-transform duration-300 group-hover:rotate-12"></i>
          </button>
        </div>
      </div>

      {/* Account row (bottom) */}
      <div ref={menuRef} className="relative mx-3 mt-3 mb-4">
        <div
          className={`group p-3 rounded-full cursor-pointer flex items-center 2xl:gap-3 justify-center 2xl:justify-start transition-all duration-200 ${
            brightOn 
              ? 'hover:bg-gradient-to-r hover:from-teal-100 hover:to-blue-100 hover:shadow-md' 
              : 'hover:bg-white/10'
          }`}
          onClick={() => setShowAccountMenu(!showAccountMenu)}
          title="Account"
        >
          {user?.profile_picture ? (
            <img 
              src={user.profile_picture} 
              alt="Profile" 
              className="h-10 w-10 rounded-full object-cover transition-all duration-200 group-hover:scale-105 border-2 border-transparent group-hover:border-primary-teal"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-teal to-blue-500 flex items-center justify-center font-bold text-white text-base transition-all duration-200 group-hover:scale-105">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex-col leading-tight flex-1 overflow-hidden hidden 2xl:flex">
            <span className={`font-bold text-[15px] transition-all duration-200 truncate ${
              brightOn 
                ? 'text-gray-900 group-hover:text-teal-700' 
                : 'text-white group-hover:text-primary-teal'
            }`}>
              {user?.full_name || 'Your Name'}
            </span>
            <span className={`text-[15px] truncate transition-colors duration-200 ${
              brightOn ? 'text-gray-600' : 'text-text-muted'
            }`}>
              @{user?.username || 'username'}
            </span>
          </div>
          <div className={`transition-all duration-200 hidden 2xl:block ${
            brightOn 
              ? 'text-gray-500 group-hover:text-teal-600' 
              : 'text-text-muted group-hover:text-primary-teal'
          }`}>
            <i className="fa-solid fa-ellipsis"></i>
          </div>
        </div>

        {/* Account Menu Dropdown */}
        {showAccountMenu && (
          <div className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-2xl overflow-hidden z-50 transition-colors duration-300 ${
            brightOn 
              ? 'bg-white border border-gray-200' 
              : 'bg-black border border-white/10'
          }`}>
            <button
              onClick={() => {
                // Clear user data from localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setShowAccountMenu(false);
                // Navigate to login page
                navigate('/login');
              }}
              className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 ${
                brightOn
                  ? 'text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <i className="fi fi-br-sign-out-alt text-lg"></i>
              <span className="font-semibold">Log out @{user?.username || 'username'}</span>
            </button>
            <button
              onClick={() => {
                setShowAccountMenu(false);
                // Navigate to signup page to add another account
                navigate('/signup');
              }}
              className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3 border-t ${
                brightOn
                  ? 'text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 hover:text-teal-600 border-gray-200'
                  : 'text-white hover:bg-white/10 border-white/10'
              }`}
            >
              <i className="fi fi-br-user-add text-lg"></i>
              <span className="font-semibold">Add another account</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
