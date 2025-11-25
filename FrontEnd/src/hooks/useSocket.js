import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { auth } from '../config/firebase';

/**
 * Custom hook for Socket.io connection management
 * Automatically handles authentication with Firebase token
 */
export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const connectSocket = async () => {
      try {
        // Get current user and Firebase token
        const user = auth.currentUser;
        if (!user) {
          console.log('No authenticated user, skipping socket connection');
          return;
        }

        // Get Firebase ID token
        const token = await user.getIdToken();

        // Connect to Socket.io server
        const socket = io('http://localhost:5000', {
          auth: {
            token
          },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5
        });

        // Store socket reference
        socketRef.current = socket;

        // Connection event handlers
        socket.on('connect', () => {
          if (mounted) {
            console.log('✅ Socket.io connected:', socket.id);
            setIsConnected(true);
            setError(null);
          }
        });

        socket.on('disconnect', (reason) => {
          if (mounted) {
            console.log('🔌 Socket.io disconnected:', reason);
            setIsConnected(false);
          }
        });

        socket.on('connect_error', (err) => {
          if (mounted) {
            console.error('❌ Socket.io connection error:', err.message);
            setError(err.message);
            setIsConnected(false);
          }
        });

        socket.on('error', (err) => {
          if (mounted) {
            console.error('❌ Socket.io error:', err);
            setError(err.message || 'Socket error');
          }
        });

        // Presence tracking - server confirms user is online
        socket.on('presence:update', (data) => {
          console.log('👤 Presence update:', data);
        });

      } catch (err) {
        if (mounted) {
          console.error('Failed to connect socket:', err);
          setError(err.message);
        }
      }
    };

    // Connect when user is authenticated
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        connectSocket();
      } else {
        // Disconnect socket when user logs out
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
          setIsConnected(false);
        }
      }
    });

    // Cleanup on unmount
    return () => {
      mounted = false;
      unsubscribe();
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error
  };
};
