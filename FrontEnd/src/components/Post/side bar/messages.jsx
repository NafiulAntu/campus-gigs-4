import React, { useState, useEffect, useRef } from "react";
import ChatWindow from "../../Chat/ChatWindow";
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase';

export default function Messages({ onBack, initialConversation = null }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const chatMenuRef = useRef(null);

  // Handle initial conversation from clicking message button on profile
  useEffect(() => {
    if (initialConversation) {
      console.log('Opening conversation:', initialConversation);
      setSelectedChat({
        conversationId: initialConversation.conversationId,
        receiverId: initialConversation.userId,
        receiverName: initialConversation.userName,
        receiverPhoto: initialConversation.userPhoto
      });
    }
  }, [initialConversation]);

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

  // Load conversations from Firestore
  useEffect(() => {
    const loadConversations = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Query conversations where user is a participant
        const conversationsRef = collection(db, 'conversations');
        const q = query(
          conversationsRef,
          where('participants', 'array-contains', currentUser.uid),
          orderBy('lastMessageTime', 'desc')
        );

        const snapshot = await getDocs(q);
        const loadedConversations = snapshot.docs.map(doc => ({
          id: doc.id,
          conversationId: doc.id,
          ...doc.data()
        }));

        setConversations(loadedConversations);
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, []);

  const handleMenuAction = (action) => {
    if (action === "details") {
      setShowDetails(!showDetails);
    }
    setShowChatMenu(false);
  };

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
            <ChatWindow 
              conversationId={selectedChat.conversationId || selectedChat.id}
              receiverId={selectedChat.receiverId || selectedChat.otherParticipant}
              receiverName={selectedChat.name}
              receiverPhoto={selectedChat.photo}
            />
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
