const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);


require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const questionRoutes = require('./routes/questions');
const testRoutes = require('./routes/tests');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const Message = require('./models/Message');
const User = require('./models/User');

const VALID_ROOMS = ['general', 'school', 'college'];

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studenthub';

if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET is not set in .env — using an insecure default for local dev only.');
}

const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

// Authenticate the socket connection using the same JWT the REST API uses
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return next(new Error('User no longer exists'));
    socket.user = user;
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  socket.on('join_room', (room) => {
    if (!VALID_ROOMS.includes(room)) return;
    socket.join(room);
  });

  socket.on('send_message', async ({ room, body }) => {
    try {
      if (!VALID_ROOMS.includes(room) || !body || !body.trim()) return;
      const message = await Message.create({ room, sender: socket.user._id, body: body.trim() });
      const payload = {
        _id: message._id,
        room,
        body: message.body,
        createdAt: message.createdAt,
        sender: { _id: socket.user._id, name: socket.user.name, role: socket.user.role }
      };
      io.to(room).emit('new_message', payload);
    } catch (err) {
      console.error('send_message failed:', err.message);
    }
  });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    httpServer.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB connection failed:', err.message));

  