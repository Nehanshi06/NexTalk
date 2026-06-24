const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');

const onlineUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('user-online', async (userId) => {
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit('presence-update', { userId, isOnline: true });
    });

    socket.on('join-conversation', (id) => socket.join(id));
    socket.on('leave-conversation', (id) => socket.leave(id));

    socket.on('send-message', async ({ conversationId, senderId, text, image }) => {
      try {
        const msg = await Message.create({ conversationId, sender: senderId, text, image });
        const populated = await Message.findById(msg._id).populate('sender', 'username avatar');
        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: msg._id, lastMessageAt: new Date() });
        io.to(conversationId).emit('receive-message', populated);

        const convo = await Conversation.findById(conversationId);
        const recipientId = convo.participants.find(p => p.toString() !== senderId)?.toString();
        const recipientSocket = onlineUsers.get(recipientId);
        if (recipientSocket) io.to(recipientSocket).emit('new-message-notification', { conversationId, message: populated });
      } catch (e) { socket.emit('error', { message: 'Send failed' }); }
    });

    socket.on('typing', ({ conversationId, username }) => socket.to(conversationId).emit('user-typing', { username }));
    socket.on('stop-typing', ({ conversationId }) => socket.to(conversationId).emit('user-stop-typing'));

    socket.on('mark-seen', async ({ conversationId, userId }) => {
      await Message.updateMany({ conversationId, sender: { $ne: userId }, seen: false }, { seen: true, seenAt: new Date() });
      io.to(conversationId).emit('messages-seen', { conversationId, seenBy: userId });
    });

    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
        io.emit('presence-update', { userId: socket.userId, isOnline: false });
      }
    });
  });
};
