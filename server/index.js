const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const http = require('http');
const { Server } = require('socket.io');
const socket = require('./socket');
const app = express();
require('dotenv').config();

app.use(helmet());
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN, optionsSuccessStatus: 200 }));
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));
// Data sanitization against XSS
app.use(xss());
// data sanitization against NoSQL injection
app.use(mongoSanitize());
// prevent HTTP parameter pollution
app.use(hpp());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/videos', require('./routes/videos'));
app.use('/uploads', express.static('uploads'));

// --- Basic API route for testing ---
app.get('/', (req, res) => {
  res.send('Marco Polo API is running!');
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/marco-polo', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  const server = http.createServer(app);
  socket.io = new Server(server, { cors: { origin: '*' } });
  socket.io.on('connection', (s) => {
    console.log('New client connected', s.id);
    s.on('register', (userId) => { socket.users[userId] = s.id; });
    s.on('disconnect', () => {
      for (const [uId, sId] of Object.entries(socket.users)) {
        if (sId === s.id) delete socket.users[uId];
      }
    });
  });
  server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});
