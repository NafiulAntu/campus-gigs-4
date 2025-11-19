import React, { useState, useEffect, useRef } from "react";

export default function Messages({ onBack }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const chatMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target)) {
        setShowChatMenu(false);
      }
    };

    if (showChatMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showChatMenu]);

  const handleMenuAction = (action) => {
    console.log(`${action} action`);
    if (action === "details") {
      setShowDetails(!showDetails);
    }
    setShowChatMenu(false);
  };

  const conversations = [
    {
      id: 1,
      name: "John Doe",
      handle: "@johndoe",
      lastMessage: "Hey! Are you available for the project?",
      time: "2m",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Sarah Smith",
      handle: "@sarahsmith",
      lastMessage: "Thanks for your help!",
      time: "1h",
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: "Mike Johnson",
      handle: "@mikej",
      lastMessage: "Can we discuss the requirements?",
      time: "3h",
      unread: 1,
      online: true,
    },
  ];

  const messages = selectedChat
    ? [
        {
          id: 1,
          sender: "them",
          text: "Hey! Are you available for the project?",
          time: "10:30 AM",
        },
        {
          id: 2,
          sender: "me",
          text: "Yes, I am! What do you need help with?",
          time: "10:32 AM",
        },
        {
          id: 3,
          sender: "them",
          text: "I need someone to help with React development",
          time: "10:35 AM",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-full mx-auto h-screen flex">
        {/* Conversations List */}
        <div className={`${showDetails ? 'hidden' : 'w-full'} md:w-80 lg:w-96 border-r border-white/10 flex flex-col ${selectedChat && !showDetails ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={onBack}
                className="h-9 w-9 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <i className="fi fi-br-arrow-left text-white text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-white">Messages</h1>
            </div>
            {/* Search */}
            <div className="flex items-center gap-2 bg-white/[0.04] px-4 py-3">
              <i className="fi fi-br-search text-text-muted"></i>
              <input
                type="text"
                placeholder="Search messages"
                className="flex-1 bg-transparent outline-none text-white placeholder:text-text-muted border-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedChat(conv)}
                className={`p-4 border-b border-white/10 cursor-pointer transition-colors hover:bg-white/[0.04] ${
                  selectedChat?.id === conv.id ? "bg-white/[0.06]" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-[#89CFF0] to-blue-500 flex items-center justify-center font-bold text-white">
                      {conv.name[0]}
                    </div>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-black rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white truncate">
                        {conv.name}
                      </h3>
                      <span className="text-xs text-text-muted">{conv.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-text-muted truncate">
                        {conv.lastMessage}
                      </p>
                      {conv.unread > 0 && (
                        <span className="ml-2 h-5 w-5 bg-[#89CFF0] rounded-full flex items-center justify-center text-xs font-bold text-black">
                          {conv.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Message Button */}
          <div className="p-4 border-t border-white/10">
            <button className="w-full bg-[#89CFF0] text-black py-3 font-semibold hover:bg-[#7bbfe0] transition-colors flex items-center justify-center gap-2">
              <i className="fi fi-br-edit"></i>
              New Message
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${showDetails ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden h-9 w-9 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                  >
                    <i className="fi fi-br-arrow-left text-xl"></i>
                  </button>
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#89CFF0] to-blue-500 flex items-center justify-center font-bold text-white">
                      {selectedChat.name[0]}
                    </div>
                    {selectedChat.online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-black rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">
                      {selectedChat.name}
                    </h2>
                    <p className="text-xs text-text-muted">
                      {selectedChat.online ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="h-9 w-9 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-[#89CFF0] transition-colors">
                    <i className="fi fi-br-microphone"></i>
                  </button>
                  <div className="relative" ref={chatMenuRef}>
                    <button 
                      onClick={() => setShowChatMenu(!showChatMenu)}
                      className="h-9 w-9 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                    >
                      <i className="fi fi-br-menu-dots"></i>
                    </button>

                    {/* Chat Menu Dropdown */}
                    {showChatMenu && (
<div className="absolute left-full top-[55px] ml-[-223px] w-60 bg-[#1a1a1a] border border-white/10 shadow-xl z-50">
                        <button
                          onClick={() => handleMenuAction("details")}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-info text-sm"></i>
                          <span className="text-sm">View Details</span>
                        </button>
                        <button
                          onClick={() => handleMenuAction("search")}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-search text-sm"></i>
                          <span className="text-sm">Search in Conversation</span>
                        </button>
                        <button
                          onClick={() => handleMenuAction("mute")}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-bell-slash text-sm"></i>
                          <span className="text-sm">Mute Notifications</span>
                        </button>
                        <button
                          onClick={() => handleMenuAction("theme")}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-palette text-sm"></i>
                          <span className="text-sm">Change Theme</span>
                        </button>
                        <button
                          onClick={() => handleMenuAction("nickname")}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-edit text-sm"></i>
                          <span className="text-sm">Edit Nicknames</span>
                        </button>
                        <button
                          onClick={() => handleMenuAction("emoji")}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-smile text-sm"></i>
                          <span className="text-sm">Change Emoji</span>
                        </button>
                        <div className="border-t border-white/10"></div>
                        <button
                          onClick={() => handleMenuAction("archive")}
                          className="w-full px-4 py-2.5 text-left text-white hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-archive text-sm"></i>
                          <span className="text-sm">Archive Chat</span>
                        </button>
                        <button
                          onClick={() => handleMenuAction("block")}
                          className="w-full px-4 py-2.5 text-left text-rose-400 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-ban text-sm"></i>
                          <span className="text-sm">Block User</span>
                        </button>
                        <button
                          onClick={() => handleMenuAction("delete")}
                          className="w-full px-4 py-2.5 text-left text-rose-400 hover:bg-white/10 transition-colors flex items-center gap-3 cursor-pointer"
                        >
                          <i className="fi fi-br-trash text-sm"></i>
                          <span className="text-sm">Delete Chat</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] sm:max-w-md px-4 py-2.5 ${
                        msg.sender === "me"
                          ? "bg-[#89CFF0] text-black"
                          : "bg-white/[0.08] text-white"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.sender === "me"
                            ? "text-black/60"
                            : "text-text-muted"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <button className="h-9 w-9 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-[#89CFF0] transition-colors">
                    <i className="fi fi-br-plus text-xl"></i>
                  </button>
                  <button className="h-9 w-9 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-[#89CFF0] transition-colors">
                    <i className="fi fi-br-camera text-lg"></i>
                  </button>
                  <button className="h-9 w-9 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-[#89CFF0] transition-colors">
                    <i className="fi fi-br-picture text-lg"></i>
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 px-4 py-2 bg-white/[0.04] text-white placeholder:text-text-muted border-0 focus:outline-none focus:bg-white/[0.08]"
                  />
                  <button className="h-9 w-9 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-[#89CFF0] transition-colors">
                    <i className="fi fi-br-smile text-lg"></i>
                  </button>
                  {messageText ? (
                    <button className="h-9 w-9 bg-[#89CFF0] hover:bg-[#7bbfe0] flex items-center justify-center text-black transition-colors">
                      <i className="fi fi-br-paper-plane text-sm"></i>
                    </button>
                  ) : (
                    <button className="h-9 w-9 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-[#89CFF0] transition-colors">
                      <i className="fi fi-br-thumbs-up text-lg"></i>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-white/[0.04] flex items-center justify-center">
                  <i className="fi fi-br-envelope text-4xl text-text-muted"></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a message
                </h3>
                <p className="text-text-muted">
                  Choose from your existing conversations or start a new one
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Details Panel */}
        {showDetails && selectedChat && (
          <div className="w-full md:w-80 lg:w-96 border-l border-white/10 bg-black overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Chat Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="h-9 w-9 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                >
                  <i className="fi fi-br-cross text-xl"></i>
                </button>
              </div>

              {/* User Info */}
              <div className="text-center mb-6 pb-6 border-b border-white/10">
                <div className="h-24 w-24 mx-auto mb-3 rounded-full bg-gradient-to-r from-[#89CFF0] to-blue-500 flex items-center justify-center font-bold text-white text-3xl">
                  {selectedChat.name[0]}
                </div>
                <h2 className="text-xl font-semibold text-white">{selectedChat.name}</h2>
                <p className="text-sm text-text-muted">{selectedChat.handle}</p>
                <p className="text-xs text-[#89CFF0] mt-2">
                  {selectedChat.online ? "● Active now" : "Offline"}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-1 mb-6">
                <button className="p-3 bg-white/[0.04] hover:bg-white/[0.08] flex flex-col items-center gap-2 transition-colors">
                  <i className="fi fi-br-user text-lg text-[#89CFF0]"></i>
                  <span className="text-xs text-white">Profile</span>
                </button>
                <button className="p-3 bg-white/[0.04] hover:bg-white/[0.08] flex flex-col items-center gap-2 transition-colors">
                  <i className="fi fi-br-bell-slash text-lg text-[#89CFF0]"></i>
                  <span className="text-xs text-white">Mute</span>
                </button>
                <button className="p-3 bg-white/[0.04] hover:bg-white/[0.08] flex flex-col items-center gap-2 transition-colors">
                  <i className="fi fi-br-search text-lg text-[#89CFF0]"></i>
                  <span className="text-xs text-white">Search</span>
                </button>
                <button className="p-3 bg-white/[0.04] hover:bg-white/[0.08] flex flex-col items-center gap-2 transition-colors">
                  <i className="fi fi-br-palette text-lg text-[#89CFF0]"></i>
                  <span className="text-xs text-white">Theme</span>
                </button>
              </div>

              {/* Customize Chat */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-text-muted uppercase mb-3">Customize Chat</h3>
                <div className="space-y-1">
                  <button className="w-full p-3 bg-white/[0.04] hover:bg-white/[0.08] text-left flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <i className="fi fi-br-palette text-white text-sm"></i>
                      <span className="text-sm text-white">Change Theme</span>
                    </div>
                    <i className="fi fi-br-angle-right text-text-muted text-sm"></i>
                  </button>
                  <button className="w-full p-3 bg-white/[0.04] hover:bg-white/[0.08] text-left flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <i className="fi fi-br-smile text-white text-sm"></i>
                      <span className="text-sm text-white">Change Emoji</span>
                    </div>
                    <i className="fi fi-br-angle-right text-text-muted text-sm"></i>
                  </button>
                  <button className="w-full p-3 bg-white/[0.04] hover:bg-white/[0.08] text-left flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <i className="fi fi-br-edit text-white text-sm"></i>
                      <span className="text-sm text-white">Edit Nicknames</span>
                    </div>
                    <i className="fi fi-br-angle-right text-text-muted text-sm"></i>
                  </button>
                </div>
              </div>

              {/* Media Section */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-text-muted uppercase">Shared Media</h3>
                  <button className="text-xs text-[#89CFF0] hover:text-[#7bbfe0]">See All</button>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="aspect-square bg-white/[0.04]"></div>
                  ))}
                </div>
              </div>

              {/* Privacy & Support */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-text-muted uppercase mb-3">Privacy & Support</h3>
                <div className="space-y-1">
                  <button className="w-full p-3 bg-white/[0.04] hover:bg-white/[0.08] text-left flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <i className="fi fi-br-bell-slash text-text-muted text-sm"></i>
                      <span className="text-sm text-text-muted">Mute Notifications</span>
                    </div>
                  </button>
                  <button className="w-full p-3 bg-white/[0.04] hover:bg-white/[0.08] text-left flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <i className="fi fi-br-ban text-text-muted text-sm"></i>
                      <span className="text-sm text-text-muted">Block</span>
                    </div>
                  </button>
                  <button className="w-full p-3 bg-white/[0.04] hover:bg-white/[0.08] text-left flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-3">
                      <i className="fi fi-br-exclamation text-text-muted text-sm"></i>
                      <span className="text-sm text-text-muted">Report</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="pt-6 border-t border-white/10">
                <button className="w-full p-3 bg-white/[0.04] hover:bg-rose-500/10 text-left flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-3">
                    <i className="fi fi-br-trash text-rose-400 text-sm"></i>
                    <span className="text-sm text-rose-400">Delete Chat</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
