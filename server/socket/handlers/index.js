import { handleChatEvents } from './chatHandler.js';
import { handleUserEvents } from './userHandler.js';
import User from '../../models/User.js';

const userSockets = new Map();

export const handleConnection = async (io, socket) => {
  // Store user socket mapping
  userSockets.set(socket.userId, socket.id);
  
  // Update user online status
  await User.findByIdAndUpdate(socket.userId, { online: true });
  
  // Broadcast user online status
  io.emit('user:online', { 
    userId: socket.userId, 
    username: socket.username 
  });

  // Register event handlers
  handleChatEvents(io, socket, userSockets);
  handleUserEvents(io, socket, userSockets);

  // Handle disconnect
  socket.on('disconnect', async () => {
    userSockets.delete(socket.userId);
    await User.findByIdAndUpdate(socket.userId, { online: false });
    io.emit('user:offline', { userId: socket.userId });
  });
};

export { userSockets };
