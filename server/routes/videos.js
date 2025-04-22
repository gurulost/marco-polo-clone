const express = require('express');
const multer = require('multer');
const path = require('path');
const Video = require('../models/Video');
const auth = require('../middleware/auth');
const { io, users } = require('../socket');

const router = express.Router();

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

// upload a new video message
router.post('/', auth, upload.single('video'), async (req, res) => {
  const { to, responseTo } = req.body;
  if (!req.file) return res.status(400).json({ msg: 'No video uploaded' });
  try {
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const videoDoc = new Video({
      from: req.userId,
      to,
      videoUrl: url,
      responseTo: responseTo || null,
    });
    await videoDoc.save();
    await videoDoc.populate('from', 'name');
    res.json(videoDoc);
    const socketId = users[to];
    if (socketId) io.to(socketId).emit('newVideo', videoDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get conversation with a friend
router.get('/:friendId', auth, async (req, res) => {
  const friendId = req.params.friendId;
  try {
    const videos = await Video.find({
      $or: [
        { from: req.userId, to: friendId },
        { from: friendId, to: req.userId }
      ]
    }).sort('createdAt');
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
