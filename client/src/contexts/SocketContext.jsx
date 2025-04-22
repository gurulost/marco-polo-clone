import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      // Request Notification permission
      if (Notification && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      // Connect socket
      // Use process.env in tests; Vite replaces import.meta.env at build time
      const s = io(process.env.VITE_SOCKET_URL);
      s.on('connect', () => {
        s.emit('register', user.id);
      });
      // Listen for new video events
      s.on('newVideo', (video) => {
        // Show desktop notification
        if (Notification.permission === 'granted') {
          new Notification(`New message from ${video.from.name}`, {
            body: 'Click to view',
            icon: ''
          }).onclick = () => {
            window.focus();
            window.location.href = `/chat/${video.from._id}`;
          };
        }
      });
      setSocket(s);
      // Cleanup on unmount
      return () => s.disconnect();
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
