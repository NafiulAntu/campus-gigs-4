import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { auth } from '../../config/firebase';
import './ChatWindow.css';

/**
 * ChatWindow Component
 * Main messaging interface with real-time updates
 */
const ChatWindow = ({ conversationId, receiverId, receiverName, receiverPhoto }) => {
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
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const currentUserId = auth.currentUser?.uid;

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
  const handleTyping = () => {
    startTyping();

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || sending) return;

    setSending(true);
    stopTyping(); // Stop typing indicator

    try {
      await sendMessage(messageInput, receiverId);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

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
        <div className="chat-header-user">
          <div className="user-avatar-container">
            <img 
              src={receiverPhoto || '/default-avatar.png'} 
              alt={receiverName}
              className="user-avatar"
            />
            {isReceiverOnline && <span className="online-badge"></span>}
          </div>
          <div className="user-info">
            <h3>{receiverName}</h3>
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
                >
                  <div className="message-content">
                    <p>{message.content}</p>
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
        <input
          type="text"
          value={messageInput}
          onChange={(e) => {
            setMessageInput(e.target.value);
            handleTyping();
          }}
          placeholder="Type a message..."
          className="message-input"
          disabled={sending || !isConnected}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!messageInput.trim() || sending || !isConnected}
        >
          {sending ? '⏳' : '📤'}
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
