import Message from '../../models/Message.js';

// Track message timestamps per user
const userMessageTimes = new Map();

export const handleChatEvents = (io, socket, userSockets) => {
  
  // Join room
  socket.on('join:room', (room) => {
    socket.join(room);
  });

  // Room message with server-side spam protection
  socket.on('message:room', async (data) => {
    try {
      const now = Date.now();
      const userId = socket.userId;

      // Get user's message history
      if (!userMessageTimes.has(userId)) {
        userMessageTimes.set(userId, []);
      }

      const messageTimes = userMessageTimes.get(userId);
      
      // Remove messages older than 10 seconds
      const recentMessages = messageTimes.filter(time => now - time < 10000);
      
      // Check for spam (more than 10 messages in 10 seconds)
      if (recentMessages.length >= 10) {
        socket.emit('error', { message: 'Slow down! You are sending messages too fast.' });
        return;
      }

      // Add current message time
      recentMessages.push(now);
      userMessageTimes.set(userId, recentMessages);

      const message = new Message({
        sender: socket.userId,
        room: data.room,
        content: data.content,
        type: 'room'
      });
      await message.save();
      
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username avatar');

      io.to(data.room).emit('message:room', populatedMessage);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Private message with server-side spam protection
  socket.on('message:private', async (data) => {
    try {
      const now = Date.now();
      const userId = socket.userId;

      // Get user's message history
      if (!userMessageTimes.has(userId)) {
        userMessageTimes.set(userId, []);
      }

      const messageTimes = userMessageTimes.get(userId);
      
      // Remove messages older than 10 seconds
      const recentMessages = messageTimes.filter(time => now - time < 10000);
      
      // Check for spam (more than 10 messages in 10 seconds)
      if (recentMessages.length >= 10) {
        socket.emit('error', { message: 'Slow down! You are sending messages too fast.' });
        return;
      }

      // Add current message time
      recentMessages.push(now);
      userMessageTimes.set(userId, recentMessages);

      const message = new Message({
        sender: socket.userId,
        receiver: data.receiverId,
        content: data.content,
        type: 'private'
      });
      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username avatar')
        .populate('receiver', 'username avatar');

      const receiverSocketId = userSockets.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message:private', populatedMessage);
      }
      
      socket.emit('message:private', populatedMessage);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Typing indicators
  socket.on('typing:start', (data) => {
    if (data.room) {
      socket.to(data.room).emit('typing:start', { 
        userId: socket.userId, 
        username: socket.username 
      });
    } else if (data.receiverId) {
      const receiverSocketId = userSockets.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:start', { 
          userId: socket.userId, 
          username: socket.username 
        });
      }
    }
  });

  socket.on('typing:stop', (data) => {
    if (data.room) {
      socket.to(data.room).emit('typing:stop', { userId: socket.userId });
    } else if (data.receiverId) {
      const receiverSocketId = userSockets.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stop', { userId: socket.userId });
      }
    }
  });
};
