const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  body: { type: String, required: true },
  answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: { type: Number, default: 0 }
}, { timestamps: true });

const QuestionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, default: '' },
  subject: { type: String, required: true, trim: true },
  level: { type: String, enum: ['school', 'college', ''], default: '' },
  classGrade: { type: String, default: '' },
  askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [AnswerSchema],
  resolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
