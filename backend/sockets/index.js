const chatSocket = require('./chatSocket');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    chatSocket(io, socket);
  });
};

module.exports = initSocket;
