const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  room: { type: String, required: true, index: true }, // 'general' | 'school' | 'college'
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
