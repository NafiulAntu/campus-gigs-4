import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({ onNavigate = () => {} }) {
  const navigate = useNavigate();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [user, setUser] = useState(null);
  const menuRef = useRef(null);

  // Load user data from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
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
  // X.com-like nav configuration
  const nav = [
    { key: "home", label: "Home", icon: "fi fi-br-home" },
    { key: "jobs", label: "Explore", icon: "fi fi-br-search" },
    { key: "notifications", label: "Notifications", icon: "fi fi-br-bell" },
    { key: "messages", label: "Messages", icon: "fi fi-br-envelope" },
    { key: "communities", label: "Communities", icon: "fi fi-br-users-alt" },
    { key: "premium", label: "Premium", icon: "fi fi-br-diamond" },
    { key: "payments", label: "Payments", icon: "fi fi-br-credit-card" },
    { key: "profile", label: "Profile", icon: "fi fi-br-user" },
  ];

  const notifCount = 3; // demo badge

  return (
    <div className="h-screen flex flex-col justify-between py-1">
      {/* Brand */}
      <div className="min-h-0">
        <div className="px-3 pt-1 mb-1">
          <div className="text-[26px] font-bold bg-gradient-to-r from-[#14b8a6] to-blue-500 bg-clip-text text-transparent">
            <span className="hidden 2xl:inline">Cam-G</span>
            <span className="inline 2xl:hidden">C</span>
          </div>
          <div className="mt-0.5 text-xs leading-tight italic text-text-muted hidden 2xl:block">
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
              className={`group relative w-full text-left px-4 py-3 rounded-full flex items-center 2xl:gap-4 justify-center 2xl:justify-start transition-all duration-200 hover:bg-white/10 text-white hover:text-primary-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-teal`}
              title={it.label}
            >
              <span className="relative">
                <i
                  className={`${it.icon} text-[26px] transition-all duration-200 group-hover:scale-105 group-hover:text-primary-teal`}
                ></i>
                {it.key === "notifications" && notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-teal text-white text-[10px] font-bold rounded-full h-[18px] min-w-[18px] flex items-center justify-center px-1">
                    {notifCount}
                  </span>
                )}
              </span>
              <span className="font-bold text-[20px] hidden 2xl:inline">
                {it.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Compose / Post button */}
        <div className="mt-4 px-3">
          <button
            onClick={() => {
              const composer = document.getElementById('post-composer');
              if (composer) {
                composer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const textarea = composer.querySelector('textarea');
                if (textarea) textarea.focus();
              }
            }}
            className="w-full text-center rounded-full bg-primary-teal hover:bg-primary-blue text-white font-bold py-3.5 transition-colors text-[17px] flex items-center justify-center"
            title="Post"
          >
            <span className="hidden 2xl:inline">Post</span>
            <i className="fi fi-br-edit inline 2xl:hidden text-[20px]"></i>
          </button>
        </div>
      </div>

      {/* Account row (bottom) */}
      <div ref={menuRef} className="relative mx-3 mt-3 mb-4">
        <div
          className="group p-3 rounded-full hover:bg-white/10 cursor-pointer flex items-center 2xl:gap-3 justify-center 2xl:justify-start transition-all duration-200"
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
            <span className="font-bold text-white text-[15px] transition-all duration-200 group-hover:text-primary-teal truncate">
              {user?.full_name || 'Your Name'}
            </span>
            <span className="text-[15px] text-text-muted truncate">
              @{user?.username || 'username'}
            </span>
          </div>
          <div className="text-text-muted transition-all duration-200 group-hover:text-primary-teal hidden 2xl:block">
            <i className="fa-solid fa-ellipsis"></i>
          </div>
        </div>

        {/* Account Menu Dropdown */}
        {showAccountMenu && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-black border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
            <button
              onClick={() => {
                setShowAccountMenu(false);
                // Add logout logic here
              }}
              className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3"
            >
              <i className="fi fi-br-sign-out-alt text-lg"></i>
              <span className="font-semibold">Log out @{user?.username || 'username'}</span>
            </button>
            <button
              onClick={() => {
                setShowAccountMenu(false);
                // Add another account logic here
              }}
              className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 border-t border-white/10"
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
