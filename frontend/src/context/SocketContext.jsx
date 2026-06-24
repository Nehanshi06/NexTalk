import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState({});

  useEffect(() => {
    if (!user) return;
    const socket = io('http://localhost:5000');
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('user-online', user._id));
    socket.on('presence-update', ({ userId, isOnline }) =>
      setOnlineUsers(p => ({ ...p, [userId]: isOnline })));
    return () => { socket.disconnect(); socketRef.current = null; };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
