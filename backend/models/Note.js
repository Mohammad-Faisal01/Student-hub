const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  topic: { type: String, default: '', trim: true },
  description: { type: String, default: '' },
  level: { type: String, enum: ['school', 'college', ''], default: '' },
  classGrade: { type: String, default: '' },
  file: { type: String, default: null }, // filename on disk under /uploads
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  downloads: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);
