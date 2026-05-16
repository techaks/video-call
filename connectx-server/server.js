const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Keep track of rooms and users
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    console.log(`User ${userId} (socket ${socket.id}) joining room: ${roomId}`);
    
    socket.join(roomId);
    
    // Store user info
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    socket.roomId = roomId;

    // Broadcast to others in the room that a user connected
    socket.to(roomId).emit('user-connected', socket.id);

    // Relay WebRTC signaling messages
    socket.on('offer', (data) => {
      // data: { to: string, offer: RTCSessionDescriptionInit }
      socket.to(data.to).emit('offer', { from: socket.id, offer: data.offer });
    });

    socket.on('answer', (data) => {
      // data: { to: string, answer: RTCSessionDescriptionInit }
      socket.to(data.to).emit('answer', { from: socket.id, answer: data.answer });
    });

    socket.on('ice-candidate', (data) => {
      // data: { to: string, candidate: RTCIceCandidateInit }
      socket.to(data.to).emit('ice-candidate', { from: socket.id, candidate: data.candidate });
    });

    socket.on('chat-message', (data) => {
      // data: { message: string, sender: string, timestamp: number }
      socket.to(roomId).emit('chat-message', { ...data, fromId: socket.id });
    });

    socket.on('reaction', (emoji) => {
      socket.to(roomId).emit('reaction', { emoji, fromId: socket.id });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      socket.to(roomId).emit('user-disconnected', socket.id);
      
      const room = rooms.get(roomId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
