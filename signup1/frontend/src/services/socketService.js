import { io } from 'socket.io-client';

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io('http://localhost:8000', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Frontend: Socket.IO connected!');
    });

    socket.on('disconnect', () => {
      console.log('Frontend: Socket.IO disconnected!');
    });

    socket.on('connect_error', (err) => {
      console.error('Frontend: Socket.IO connection error:', err.message);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}; 