const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedOptionIndex: Number }],
  score: { type: Number, default: null }, // null until submitted/graded
  totalQuestions: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date, default: null }
}, { timestamps: true });

// One attempt per student per test
SubmissionSchema.index({ test: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
