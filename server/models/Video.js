const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  videoUrl: { type: String, required: true },
  responseTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
