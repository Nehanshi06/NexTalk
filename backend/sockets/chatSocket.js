const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

// Map userId -> socketId
const onlineUsers = new Map();

const chatSocket = (io, socket) => {
  // User comes online
  socket.on('user-online', async (userId) => {
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit('presence-update', { userId, isOnline: true });
  });

  // Join a conversation room
  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });

  // Leave conversation room
  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  // Send a message
  socket.on('send-message', async ({ conversationId, senderId, text, image }) => {
    try {
      const message = await Message.create({ conversationId, sender: senderId, text, image });
      const populated = await Message.findById(message._id).populate('sender', 'username avatar');

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: message._id,
        lastMessageAt: new Date(),
      });

      io.to(conversationId).emit('receive-message', populated);

      // Send notification to recipient if not in this conversation room
      const convo = await Conversation.findById(conversationId);
      const recipientId = convo.participants.find(p => p.toString() !== senderId)?.toString();
      if (recipientId) {
        const recipientSocketId = onlineUsers.get(recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new-message-notification', {
            conversationId,
            message: populated,
          });
        }
      }
    } catch (error) {
      socket.emit('error', { message: 'Message failed' });
    }
  });

  // Typing indicators
  socket.on('typing', ({ conversationId, username }) => {
    socket.to(conversationId).emit('user-typing', { username });
  });

  socket.on('stop-typing', ({ conversationId }) => {
    socket.to(conversationId).emit('user-stop-typing');
  });

  // Mark seen
  socket.on('mark-seen', async ({ conversationId, userId }) => {
    await Message.updateMany(
      { conversationId, sender: { $ne: userId }, seen: false },
      { seen: true, seenAt: new Date() }
    );
    io.to(conversationId).emit('messages-seen', { conversationId, seenBy: userId });
  });

  // Disconnect
  socket.on('disconnect', async () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
      io.emit('presence-update', { userId: socket.userId, isOnline: false });
    }
  });
};

module.exports = chatSocket;
