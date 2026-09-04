const mongoose = require('mongoose');

const QuestionItemSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true, validate: v => v.length >= 2 },
  correctOptionIndex: { type: Number, required: true }
}, { _id: true });

const TestSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  scheduledAt: { type: Date, required: true }, // exact date+time the test unlocks
  durationMinutes: { type: Number, required: true, min: 1 },
  questions: { type: [QuestionItemSchema], required: true, validate: v => v.length > 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Test', TestSchema);
