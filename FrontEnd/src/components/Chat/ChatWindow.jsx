import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useChat } from '../../hooks/useChat';
import { auth } from '../../config/firebase';
import DeleteIcon from '../../assets/icons/DeleteIcon';
import ForwardIcon from '../../assets/icons/ForwardIcon';
import SelectAllIcon from '../../assets/icons/SelectAllIcon';
import CancelIcon from '../../assets/icons/CancelIcon';
import SwapIcon from '../../assets/icons/SwapIcon';
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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const contextMenuRef = useRef(null);
  const currentUserId = auth.currentUser?.uid;

  // Clear input when conversation changes to prevent override
  useEffect(() => {
    setMessageInput('');
  }, [conversationId]);

  // Auto-focus input when user starts typing
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if already focused on input, or if selection mode is active
      if (document.activeElement === inputRef.current || selectionMode) return;
      
      // Ignore special keys (Ctrl, Alt, Escape, etc.)
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) return;
      
      // Focus input and let the character be typed
      if (inputRef.current && e.key.match(/^[a-zA-Z0-9 ]$/)) {
        inputRef.current.focus();
      }
    };

    document.addEventListener('keypress', handleKeyPress);
    return () => document.removeEventListener('keypress', handleKeyPress);
  }, [selectionMode]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu]);

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

  // Toggle message selection
  const toggleMessageSelection = useCallback((messageId) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      if (newSet.size === 0) {
        setSelectionMode(false);
      }
      return newSet;
    });
  }, []);

  // Start selection mode
  const startSelectionMode = useCallback((messageId) => {
    setSelectionMode(true);
    setSelectedMessages(new Set([messageId]));
  }, []);

  // Cancel selection
  const cancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedMessages(new Set());
  }, []);

  // Reverse selection: invert which messages are selected
  const reverseSelection = useCallback(() => {
    setSelectedMessages(prev => {
      const newSet = new Set();
      messages.forEach(msg => {
        if (!prev.has(msg.id)) {
          newSet.add(msg.id);
        }
      });
      return newSet;
    });
  }, [messages]);

  // Select all messages
  const selectAllMessages = useCallback(() => {
    const allIds = new Set(messages.map(msg => msg.id));
    setSelectedMessages(allIds);
    if (!selectionMode) {
      setSelectionMode(true);
    }
  }, [messages, selectionMode]);

  // Delete selected messages
  const deleteSelectedMessages = useCallback(async () => {
    if (!window.confirm(`Delete ${selectedMessages.size} message(s)?`)) return;

    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');
      
      const deletePromises = Array.from(selectedMessages).map(messageId => {
        const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
        return deleteDoc(messageRef);
      });
      
      await Promise.all(deletePromises);
      cancelSelection();
    } catch (error) {
      console.error('Error deleting messages:', error);
      alert('Failed to delete messages');
    }
  }, [selectedMessages, conversationId, cancelSelection]);

  // Delete single message
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
      const { deleteDoc, doc } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');
      
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  }, [conversationId]);

  // Forward messages: duplicates selected or provided messages into target conversation
  const handleForwardMessages = useCallback(async (messagesToForward) => {
    try {
      // Determine which messages to forward
      let items = [];
      if (Array.isArray(messagesToForward) && messagesToForward.length > 0) {
        items = messagesToForward;
      } else {
        // Use currently selected messages
        items = Array.from(selectedMessages).map(id => messages.find(m => m.id === id)).filter(Boolean);
      }

      if (items.length === 0) {
        alert('No messages selected to forward');
        cancelSelection();
        return;
      }

      const target = window.prompt('Enter target conversation ID to forward to (paste conversation id):');
      if (!target || !target.trim()) {
        cancelSelection();
        return;
      }

      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../../config/firebase');

      const writes = items.map(item => {
        const payload = {
          content: item.content,
          senderId: currentUserId,
          forwardedFrom: item.senderId,
          originalTimestamp: item.timestamp || null,
          timestamp: serverTimestamp(),
        };

        const colRef = collection(db, 'conversations', target, 'messages');
        return addDoc(colRef, payload);
      });

      await Promise.all(writes);
      alert(`Forwarded ${items.length} message(s)`);
      cancelSelection();
    } catch (error) {
      console.error('Error forwarding messages:', error);
      alert('Failed to forward messages');
    }
  }, [selectedMessages, messages, cancelSelection, currentUserId]);

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
        {selectionMode ? (
          // Selection Mode Header (Telegram-style)
          <>
            <button 
              onClick={cancelSelection}
              style={{
                background: 'none',
                border: 'none',
                color: '#89CFF0',
                cursor: 'pointer',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Cancel Selection"
            >
              <CancelIcon size={24} />
            </button>
            <div style={{ flex: 1, color: '#fff', fontSize: '16px', fontWeight: '600' }}>
              {selectedMessages.size} selected
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingRight: '8px' }}>
              <button
                onClick={selectAllMessages}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#89CFF0',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Select All"
              >
                <SelectAllIcon size={22} />
              </button>
              <button
                onClick={reverseSelection}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#89CFF0',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Reverse Selection"
              >
                <SwapIcon size={22} />
              </button>
              <button
                onClick={handleForwardMessages}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#89CFF0',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Forward"
              >
                <ForwardIcon size={22} />
              </button>
              <button
                onClick={deleteSelectedMessages}
                style={{
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                title="Delete"
              >
                <DeleteIcon size={22} />
              </button>
            </div>
          </>
        ) : (
          // Normal Header
          <>
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
          </>
        )}
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
              const isSelected = selectedMessages.has(message.id);

              return (
                <div 
                  key={message.id} 
                  className={`message ${isOwn ? 'message-own' : 'message-other'}`}
                  style={{ 
                    position: 'relative', 
                    cursor: selectionMode ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexDirection: isOwn ? 'row-reverse' : 'row'
                  }}
                  onClick={() => selectionMode && toggleMessageSelection(message.id)}
                  onDoubleClick={() => startSelectionMode(message.id)}
                  onContextMenu={(e) => {
                    if (!isOwn || selectionMode) return;
                    e.preventDefault();
                    setContextMenu({
                      messageId: message.id,
                      message: message,
                      x: e.clientX,
                      y: e.clientY
                    });
                  }}
                >
                  {/* Selection Checkbox */}
                  {selectionMode && (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: `2px solid ${isSelected ? '#89CFF0' : 'rgba(255, 255, 255, 0.3)'}`,
                      background: isSelected ? '#89CFF0' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      flexShrink: 0
                    }}>
                      {isSelected && <span style={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>✓</span>}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <div className="message-content" style={{ 
                      position: 'relative',
                      background: isSelected ? (isOwn ? 'linear-gradient(135deg, #6ab8e0 0%, #4a8eb1 100%)' : 'rgba(255, 255, 255, 0.05)') : undefined,
                      transition: 'all 0.2s ease'
                    }}>
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
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Context Menu for Message Actions */}
        {contextMenu && (
          <div
            ref={contextMenuRef}
            style={{
              position: 'fixed',
              top: `${contextMenu.y}px`,
              left: `${contextMenu.x}px`,
              background: '#2b2b2b',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
              minWidth: '160px',
              zIndex: 1000,
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            <button
              onClick={() => {
                startSelectionMode(contextMenu.messageId);
                setContextMenu(null);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '400',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <SelectAllIcon size={16} />
              Select
            </button>
            <button
              onClick={() => {
                handleForwardMessages([contextMenu.message]);
                setContextMenu(null);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                color: '#fff',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '400',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ForwardIcon size={16} />
              Forward
            </button>
            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '4px 0' }} />
            <button
              onClick={() => {
                handleDeleteMessage(contextMenu.messageId);
                setContextMenu(null);
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                color: '#ef4444',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '400',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <DeleteIcon size={16} />
              Delete
            </button>
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
