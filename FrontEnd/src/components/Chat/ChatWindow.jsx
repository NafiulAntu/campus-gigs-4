import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useChat } from '../../hooks/useChat';
import { auth } from '../../config/firebase';
import './ChatWindow.css';

/**
 * ChatWindow Component
 * Main messaging interface with real-time updates
 */
const ChatWindow = memo(({ conversationId, receiverId, receiverName = 'User', receiverPhoto, onViewProfile }) => {
  const {
    messages,
    loading,
    typingUsers,
    onlineUsers,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead
  } = useChat(conversationId);

  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const currentUserId = auth.currentUser?.uid;

  // Clear input when conversation changes to prevent override
  useEffect(() => {
    setMessageInput('');
  }, [conversationId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  // Auto-resize textarea based on content (like Facebook/LinkedIn)
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      // Reset height to get accurate scrollHeight
      textarea.style.height = '40px';
      
      // Calculate new height based on content
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, 40), 200);
      
      // Smoothly transition to new height
      textarea.style.height = newHeight + 'px';
      
      // Enable scrolling only when max height reached
      if (scrollHeight > 200) {
        textarea.style.overflowY = 'auto';
      } else {
        textarea.style.overflowY = 'hidden';
      }
    }
  }, [messageInput]);

  // Handle viewing receiver's profile
  const handleViewProfile = useCallback(() => {
    if (onViewProfile && receiverId) {
      onViewProfile(receiverId);
    }
  }, [onViewProfile, receiverId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark unread messages as read when viewing conversation
  useEffect(() => {
    if (!messages.length || !currentUserId) return;

    const unreadMessages = messages.filter(msg => 
      msg.senderId !== currentUserId && 
      !msg.readBy?.includes(currentUserId)
    );

    if (unreadMessages.length > 0) {
      markAsRead(unreadMessages.map(msg => msg.id));
    }
  }, [messages, currentUserId, markAsRead]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    startTyping();

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }, [startTyping, stopTyping]);

  // Send message
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || sending) return;

    const messageToSend = messageInput.trim();
    setSending(true);
    stopTyping(); // Stop typing indicator

    try {
      await sendMessage(messageToSend, receiverId);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore input value on error
      setMessageInput(messageToSend);
    } finally {
      setSending(false);
    }
  }, [messageInput, sending, sendMessage, receiverId, stopTyping]);

  // Delete message
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');
      
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await deleteDoc(messageRef);
      
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  }, [conversationId]);

  // Handle input change with smooth auto-resize
  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setMessageInput(value);
    handleTyping();
    
    // Immediate resize for better UX
    const textarea = e.target;
    textarea.style.height = '40px';
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, 40), 200);
    textarea.style.height = newHeight + 'px';
    
    // Show scrollbar only when content exceeds max height
    if (scrollHeight > 200) {
      textarea.style.overflowY = 'auto';
    } else {
      textarea.style.overflowY = 'hidden';
    }
  }, [handleTyping]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) return 'Just now';
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    
    // This week
    if (diff < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    }
    
    // Older
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-loading">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  const isReceiverOnline = onlineUsers.includes(receiverId);
  const isReceiverTyping = typingUsers.includes(receiverId);

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-user" onClick={handleViewProfile} style={{ cursor: 'pointer' }} title="View profile">
          <div className="user-avatar-container">
            {receiverPhoto ? (
              <img 
                src={receiverPhoto} 
                alt={receiverName}
                className="user-avatar"
              />
            ) : (
              <div className="user-avatar" style={{ 
                background: 'linear-gradient(135deg, #89CFF0 0%, #5FAED1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '18px'
              }}>
                {receiverName ? receiverName[0].toUpperCase() : 'U'}
              </div>
            )}
            {isReceiverOnline && <span className="online-badge"></span>}
          </div>
          <div className="user-info">
            <h3>{receiverName || 'User'}</h3>
            <span className="user-status">
              {isReceiverTyping ? 'typing...' : isReceiverOnline ? 'online' : 'offline'}
            </span>
          </div>
        </div>
        <div className="connection-status">
          {isConnected ? (
            <span className="status-connected">🟢 Connected</span>
          ) : (
            <span className="status-disconnected">🔴 Disconnected</span>
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => {
              const isOwn = message.senderId === currentUserId;
              const isRead = message.readBy?.includes(receiverId);

              return (
                <div 
                  key={message.id} 
                  className={`message ${isOwn ? 'message-own' : 'message-other'}`}
                  style={{ position: 'relative' }}
                >
                  <div className="message-content" style={{ position: 'relative' }}>
                    {/* Three dots menu button - inside message-content */}
                    {isOwn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === message.id ? null : message.id);
                        }}
                        className="message-menu-btn"
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'rgba(0, 0, 0, 0.2)',
                          color: '#000',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          opacity: 0,
                          transition: 'all 0.2s ease',
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title="Options"
                      >
                        ⋮
                      </button>
                    )}
                    
                    {/* Dropdown menu */}
                    {openMenuId === message.id && isOwn && (
                      <div
                        ref={menuRef}
                        className="message-dropdown-menu"
                        style={{
                          position: 'absolute',
                          top: '30px',
                          right: '4px',
                          background: '#1a1a1a',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '12px',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                          minWidth: '180px',
                          zIndex: 1000,
                          overflow: 'hidden',
                          animation: 'fadeIn 0.2s ease-out'
                        }}
                      >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMessage(message.id);
                        }}
                        style={{
                          width: '100%',
                          padding: '14px 18px',
                          border: 'none',
                          background: 'transparent',
                          color: '#ef4444',
                          textAlign: 'left',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                          e.currentTarget.style.paddingLeft = '22px';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.paddingLeft = '18px';
                        }}
                      >
                        <span style={{ fontSize: '18px' }}>🗑️</span>
                        Delete Message
                      </button>
                    </div>
                    )}
                    
                    <p style={{ paddingRight: isOwn ? '30px' : '0' }}>{message.content}</p>
                  </div>
                  <div className="message-meta">
                    <span className="message-time">{formatTime(message.timestamp)}</span>
                    {isOwn && (
                      <span className="message-status">
                        {isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Typing Indicator */}
        {isReceiverTyping && (
          <div className="typing-indicator">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form className="message-input-container" onSubmit={handleSendMessage}>
        <textarea
          ref={inputRef}
          value={messageInput}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            // Send on Enter, new line on Shift+Enter
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
          placeholder="Type a message..."
          className="message-input"
          disabled={sending || !isConnected}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          rows={1}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!messageInput.trim() || sending || !isConnected}
          title="Send message"
        >
          {sending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" fill="currentColor"/>
            </svg>
          )}
        </button>
      </form>
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export default ChatWindow;
