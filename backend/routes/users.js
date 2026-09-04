const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Note = require('../models/Note');
const Submission = require('../models/Submission');
const { auth } = require('../middleware/auth');

router.get('/me/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const [doubtsAsked, notesUploaded, submissions] = await Promise.all([
      Question.countDocuments({ askedBy: userId }),
      Note.countDocuments({ uploadedBy: userId }),
      Submission.find({ student: userId, submittedAt: { $ne: null } })
    ]);

    const doubtsAnswered = await Question.countDocuments({ 'answers.answeredBy': userId });

    const testsCompleted = submissions.length;
    const avgScorePercent = testsCompleted > 0
      ? Math.round(submissions.reduce((sum, s) => sum + (s.score / s.totalQuestions) * 100, 0) / testsCompleted)
      : 0;

    res.json({ doubtsAsked, doubtsAnswered, notesUploaded, testsCompleted, avgScorePercent });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
