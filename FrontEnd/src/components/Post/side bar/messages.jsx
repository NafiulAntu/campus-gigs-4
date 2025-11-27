import React, { useState, useEffect, useRef } from "react";
import ChatWindow from "../../Chat/ChatWindow";
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../../config/firebase';
import { searchUsers } from '../../../services/api';
import { getOrCreateConversation } from '../../../utils/messagingUtils';

export default function Messages({ onBack, initialConversation = null, onViewProfile }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState("");
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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

  // Load conversations from Firestore with real-time updates
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('❌ No authenticated user for conversations');
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Query conversations where user is a participant
      const conversationsRef = collection(db, 'conversations');
      
      // Try query with orderBy first
      let q;
      try {
        q = query(
          conversationsRef,
          where('participants', 'array-contains', currentUser.uid),
          orderBy('lastMessageTime', 'desc')
        );
      } catch (indexError) {
        console.warn('⚠️ Composite index not found, using simple query:', indexError);
        // Fallback to simple query without orderBy
        q = query(
          conversationsRef,
          where('participants', 'array-contains', currentUser.uid)
        );
      }

      // Real-time listener for conversations
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const loadedConversations = snapshot.docs.map(doc => {
            const data = doc.data();
            const otherUserId = data.participants?.find(p => p !== currentUser.uid);
            
            // Get the participant info for the OTHER user
            const allParticipantInfo = data.participantInfo || {};
            const participantInfo = allParticipantInfo[otherUserId] || {};
            
            // Get the user name with multiple fallback attempts
            const userName = participantInfo.name || 
                           participantInfo.userName || 
                           participantInfo.fullName || 
                           'User';
            
            const userPhoto = participantInfo.photo || 
                            participantInfo.userPhoto || 
                            participantInfo.profilePicture || 
                            null;
            
            return {
              id: doc.id,
              conversationId: doc.id,
              name: userName,
              photo: userPhoto,
              lastMessage: data.lastMessage || 'Start a conversation',
              lastMessageTime: data.lastMessageTime, // Keep raw timestamp for sorting
              time: data.lastMessageTime?.toDate ? formatTime(data.lastMessageTime.toDate()) : 'Now',
              unread: data.unreadCount?.[currentUser.uid] || 0,
              online: false,
              receiverId: otherUserId,
              receiverName: userName,
              receiverPhoto: userPhoto
            };
          });

          // Sort by lastMessageTime if we couldn't use orderBy in query
          loadedConversations.sort((a, b) => {
            const timeA = a.lastMessageTime?.toDate?.() || new Date(0);
            const timeB = b.lastMessageTime?.toDate?.() || new Date(0);
            return timeB - timeA;
          });

          setConversations(loadedConversations);
          setLoading(false);
        }, 
        (error) => {
          console.error('❌ Error loading conversations:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          // If it's an index error, provide helpful message
          if (error.code === 'failed-precondition') {
            console.error('🔥 Firestore Index Required!');
            console.error('Create composite index: conversations collection');
            console.error('Fields: participants (Array), lastMessageTime (Descending)');
            if (error.message.includes('https://')) {
              const indexUrl = error.message.match(/https:\/\/[^\s]+/)?.[0];
              if (indexUrl) {
                console.error('📝 Create index here:', indexUrl);
              }
            }
          }
          
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('❌ Error setting up conversations listener:', error);
      setLoading(false);
    }
  }, []);

  // Format timestamp for conversation list
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
    return date.toLocaleDateString();
  };

  const handleMenuAction = (action) => {
    if (action === "details") {
      setShowDetails(!showDetails);
    }
    setShowChatMenu(false);
  };

  // Handle search with debounce
  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const response = await searchUsers(searchQuery);
          const currentUser = auth.currentUser;
          
          // Filter out current user and users without firebase_uid
          const filteredResults = response.data.data.filter(user => 
            user.firebase_uid && 
            user.firebase_uid !== currentUser?.uid
          );
          
          setSearchResults(filteredResults);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Start conversation with searched user
  const handleStartConversation = async (user) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert('Please login to send messages');
        return;
      }

      // Get current user's info
      const currentUserData = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserName = currentUserData.full_name || currentUserData.username || currentUser.displayName || 'User';
      const currentUserPhoto = currentUserData.profile_picture || currentUser.photoURL || null;

      // Create or get conversation
      const conversationId = await getOrCreateConversation(
        currentUser.uid,
        user.firebase_uid,
        user.full_name || user.username || 'User',
        user.profile_picture,
        currentUserName,
        currentUserPhoto
      );

      // Clear search and select conversation
      setSearchQuery('');
      setSearchResults([]);
      setSelectedChat({
        conversationId,
        receiverId: user.firebase_uid,
        receiverName: user.full_name || user.username,
        receiverPhoto: user.profile_picture
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-full mx-auto h-screen flex">
        {/* Conversations List */}
        <div className={`${showDetails ? 'hidden' : 'w-full'} md:w-80 lg:w-96 border-r border-white/10 flex flex-col ${selectedChat && !showDetails ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={onBack}
                className="h-10 w-10 hover:bg-white/5 rounded-lg flex items-center justify-center transition-all"
              >
                <i className="fi fi-br-arrow-left text-white text-xl"></i>
              </button>
              <h1 className="text-2xl font-bold text-white tracking-tight">Messages</h1>
            </div>
            {/* Search */}
            <div className="flex items-center gap-3 bg-[#1a1a1a] px-4 py-3 rounded-[22px] border border-white/[0.15] transition-all hover:border-white/[0.25] focus-within:border-[#89CFF0] focus-within:bg-[#0f0f0f]">
              <i className="fi fi-br-search text-[#64748b]"></i>
              <input
                type="text"
                placeholder="Search users to message"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white placeholder:text-[#64748b] border-0"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="text-[#64748b] hover:text-white transition-colors"
                >
                  <i className="fi fi-br-cross text-sm"></i>
                </button>
              )}
            </div>
          </div>

          {/* Search Results or Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {searchQuery ? (
              // Search Mode
              <div className="p-3">
                {searchResults.length > 0 ? (
                  // Search Results
                  <>
                    <div className="flex items-center justify-between mb-3 px-2">
                      <div className="text-xs text-[#64748b] font-semibold tracking-wide">
                        SEARCH RESULTS
                      </div>
                      <div className="text-xs text-[#89CFF0] font-bold">
                        {searchResults.length}
                      </div>
                    </div>
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleStartConversation(user)}
                        className="group p-4 mb-2 rounded-xl cursor-pointer transition-all bg-white/[0.02] border border-white/[0.05] hover:bg-[#89CFF0]/[0.08] hover:border-[#89CFF0]/[0.3] hover:shadow-lg hover:shadow-[#89CFF0]/[0.1]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#89CFF0] to-[#5FAED1] flex items-center justify-center font-bold text-black shadow-md group-hover:shadow-lg transition-shadow">
                              {(user.full_name || user.username || 'U')[0].toUpperCase()}
                            </div>
                            {user.profile_picture && (
                              <img 
                                src={user.profile_picture} 
                                alt="" 
                                className="absolute inset-0 h-12 w-12 rounded-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate tracking-tight group-hover:text-[#89CFF0] transition-colors">
                              {user.full_name || user.username || 'Unknown User'}
                            </h3>
                            <p className="text-[13px] text-[#94a3b8] truncate">
                              @{user.username || user.email?.split('@')[0]} {user.profession && `• ${user.profession}`}
                            </p>
                          </div>
                          <div className="text-[#89CFF0] opacity-0 group-hover:opacity-100 transition-opacity">
                            <i className="fi fi-br-paper-plane"></i>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : isSearching ? (
                  <div className="text-center py-12">
                    <div className="inline-block h-10 w-10 border-3 border-[#89CFF0] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#94a3b8] mt-4 font-medium">Searching users...</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-white/[0.03] flex items-center justify-center">
                      <i className="fi fi-br-search text-3xl text-[#64748b]"></i>
                    </div>
                    <p className="text-white font-medium mb-1">No users found</p>
                    <p className="text-[#64748b] text-sm">Try searching by username or name</p>
                  </div>
                )}
              </div>
            ) : (
              // Conversations List Mode
              <>
                {conversations.length > 0 ? (
                  <div className="p-3">
                    <div className="flex items-center justify-end mb-3 px-2">
                      <div className="text-xs text-[#89CFF0] font-bold">
                        {conversations.length}
                      </div>
                    </div>
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedChat(conv)}
                        className={`group p-4 mb-2 rounded-xl cursor-pointer transition-all ${
                          selectedChat?.id === conv.id 
                            ? "bg-[#89CFF0]/[0.12] border border-[#89CFF0]/[0.35] shadow-lg shadow-[#89CFF0]/[0.15]" 
                            : "bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1]"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            {conv.photo ? (
                              <img 
                                src={conv.photo} 
                                alt={conv.name}
                                className="h-12 w-12 rounded-full object-cover shadow-md"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#89CFF0] to-[#5FAED1] flex items-center justify-center font-bold text-black shadow-md">
                                {conv.name[0].toUpperCase()}
                              </div>
                            )}
                            {conv.online && (
                              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-[#22c55e] border-2 border-black rounded-full"></span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <h3 className="font-semibold text-white truncate tracking-tight">
                                {conv.name}
                              </h3>
                              <span className="text-xs text-[#64748b] font-medium whitespace-nowrap ml-2">{conv.time}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[13.5px] text-[#94a3b8] truncate flex-1">
                                {conv.lastMessage || 'Start a conversation'}
                              </p>
                              {conv.unread > 0 && (
                                <span className="h-5 px-2 min-w-[20px] bg-[#89CFF0] rounded-full flex items-center justify-center text-xs font-bold text-black shadow-md shadow-[#89CFF0]/30 flex-shrink-0">
                                  {conv.unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center py-12">
                      <div className="inline-block h-12 w-12 border-3 border-[#89CFF0] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-[#94a3b8] font-medium">Loading conversations...</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center py-12 px-6">
                      <div className="h-20 w-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#89CFF0]/10 to-[#5FAED1]/10 flex items-center justify-center border border-white/[0.1]">
                        <i className="fi fi-br-comment-alt text-4xl text-[#89CFF0]"></i>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 tracking-tight">
                        No conversations yet
                      </h3>
                      <p className="text-[#94a3b8] text-sm mb-4 max-w-xs mx-auto">
                        Search for users above to start your first conversation
                      </p>
                      <div className="inline-flex items-center gap-2 text-[#89CFF0] text-sm font-medium">
                        <i className="fi fi-br-search"></i>
                        <span>Use search to find people</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* New Message Button */}
          <div className="p-4 border-t border-white/10">
            <button 
              onClick={() => {
                const searchInput = document.querySelector('input[placeholder="Search users to message"]');
                if (searchInput) searchInput.focus();
              }}
              className="w-full bg-gradient-to-r from-[#89CFF0] to-[#5FAED1] text-black py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-[#89CFF0]/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <i className="fi fi-br-edit"></i>
              New Message
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${showDetails ? 'hidden md:flex' : 'flex'}`}>
          {selectedChat ? (
            <>
              <ChatWindow 
                conversationId={selectedChat.conversationId || selectedChat.id}
                receiverId={selectedChat.receiverId || selectedChat.otherParticipant}
                receiverName={selectedChat.name || selectedChat.receiverName || 'User'}
                receiverPhoto={selectedChat.photo || selectedChat.receiverPhoto}
                onViewProfile={(userId) => {
                  if (onViewProfile) {
                    onViewProfile(userId);
                  }
                }}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="h-24 w-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#89CFF0]/10 to-[#5FAED1]/10 flex items-center justify-center border border-white/[0.1]">
                  <i className="fi fi-br-envelope text-5xl text-[#89CFF0]"></i>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
                  Select a message
                </h3>
                <p className="text-[#94a3b8] text-[15px]">
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
