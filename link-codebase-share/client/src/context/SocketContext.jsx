import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempted, setConnectionAttempted] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Create a mock socket for when backend is not available
  const createMockSocket = () => {
    return {
      connected: false,
      emit: () => {}, // No-op function
      on: () => {}, // No-op function
      off: () => {}, // No-op function
      disconnect: () => {}, // No-op function
      connect: () => {}, // No-op function
    };
  };

  useEffect(() => {
    // Only try to connect once and handle errors gracefully
    if (connectionAttempted) return;

    // Check if backend is available before attempting Socket.IO connection
    const checkBackendAvailability = async () => {
      // Simple check: if we're not on localhost, skip socket connection
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        setConnectionAttempted(true);
        setSocket(createMockSocket());
        return;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch('http://localhost:8800/health', {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setBackendAvailable(true);
          initializeSocket();
        } else {
          setConnectionAttempted(true);
          setSocket(createMockSocket());
        }
      } catch (error) {
        setConnectionAttempted(true);
        setSocket(createMockSocket());
      }
    };

    const initializeSocket = async () => {
      try {
        // Dynamically import socket.io-client only if backend is available
        const { io } = await import('socket.io-client');
        
        const socketInstance = io("http://localhost:4000", {
          timeout: 3000,
          reconnection: false,
          autoConnect: false
        });

        // Handle connection events
        socketInstance.on('connect', () => {
          setIsConnected(true);
        });

        socketInstance.on('connect_error', (error) => {
          setIsConnected(false);
          setSocket(createMockSocket());
        });

        socketInstance.on('disconnect', () => {
          setIsConnected(false);
        });

        // Try to connect
        socketInstance.connect();
        setSocket(socketInstance);
      } catch (error) {
        setSocket(createMockSocket());
      }
    };

    // Check backend availability first
    checkBackendAvailability();
    setConnectionAttempted(true);

    // Cleanup on unmount
    return () => {
      if (socket && socket.disconnect) {
        socket.disconnect();
      }
    };
  }, [connectionAttempted]);

  useEffect(() => {
    if (currentUser && socket && isConnected) {
      socket.emit("newUser", currentUser.id);
    }
  }, [currentUser, socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, backendAvailable }}>
      {children}
    </SocketContext.Provider>
  );
};
 