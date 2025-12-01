import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

let socket = null;

export function connectSocket(userId, role = 'employee') {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: false
    });
  }
  if (userId) {
    socket.emit('register', { user_id: userId, role });
  }
  return socket;
}

export function getSocket() {
  return socket;
}
