const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const xss = require('xss-clean');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(helmet());
app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN, optionsSuccessStatus: 200 }));
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/videos', require('./routes/videos'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => res.send('Marco Polo API is running!'));

module.exports = app;
