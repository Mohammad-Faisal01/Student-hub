const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Submission = require('../models/Submission');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { notify } = require('../utils/notify');

function computeStatus(test, now = new Date()) {
  const start = new Date(test.scheduledAt);
  const end = new Date(start.getTime() + test.durationMinutes * 60000);
  if (now < start) return 'upcoming';
  if (now >= start && now < end) return 'live';
  return 'closed';
}

// GET /api/tests — list, with each test's status and the current student's submission state
router.get('/', auth, async (req, res) => {
  try {
    const tests = await Test.find().populate('createdBy', 'name').sort({ scheduledAt: 1 });
    const now = new Date();

    const withStatus = await Promise.all(tests.map(async t => {
      const submission = await Submission.findOne({ test: t._id, student: req.user._id });
      return {
        _id: t._id,
        title: t.title,
        subject: t.subject,
        description: t.description,
        scheduledAt: t.scheduledAt,
        durationMinutes: t.durationMinutes,
        questionCount: t.questions.length,
        createdBy: t.createdBy,
        status: computeStatus(t, now),
        submissionStatus: submission ? (submission.submittedAt ? 'submitted' : 'in_progress') : 'not_started',
        score: submission?.submittedAt ? submission.score : null
      };
    }));

    res.json(withStatus);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// POST /api/tests — admin creates a test in advance, with questions + correct answers already set
router.post('/', auth, requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const { title, subject, description, scheduledAt, durationMinutes, questions } = req.body;

    if (!title || !subject || !scheduledAt || !durationMinutes || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Title, subject, schedule, duration, and at least one question are required' });
    }
    for (const q of questions) {
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2 || q.correctOptionIndex === undefined) {
        return res.status(400).json({ error: 'Every question needs text, at least 2 options, and a correct answer' });
      }
    }
    if (new Date(scheduledAt) <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const test = await Test.create({
      title, subject, description: description || '',
      scheduledAt, durationMinutes, questions, createdBy: req.user._id
    });

    // Notify every student so they know a test has been scheduled
    const students = await User.find({ role: 'student' }).select('_id');
    const when = new Date(scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    await Promise.all(students.map(s =>
      notify(s._id, `New test scheduled: "${title}" (${subject}) on ${when}`, 'test_scheduled', test._id)
    ));

    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// GET /api/tests/:id — metadata only if upcoming; questions (no answers) once live/closed
router.get('/:id', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('createdBy', 'name');
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const status = computeStatus(test);
    const submission = await Submission.findOne({ test: test._id, student: req.user._id });

    const base = {
      _id: test._id, title: test.title, subject: test.subject, description: test.description,
      scheduledAt: test.scheduledAt, durationMinutes: test.durationMinutes,
      questionCount: test.questions.length, status,
      submissionStatus: submission ? (submission.submittedAt ? 'submitted' : 'in_progress') : 'not_started'
    };

    if (status === 'upcoming') {
      // Questions stay hidden until the scheduled time arrives — this is the "locked" part
      return res.json(base);
    }

    // Never send correctOptionIndex to the client during a live attempt
    const safeQuestions = test.questions.map(q => ({ _id: q._id, questionText: q.questionText, options: q.options }));
    res.json({ ...base, questions: safeQuestions, submissionId: submission?._id || null });
  } catch (err) {
    res.status(404).json({ error: 'Test not found' });
  }
});

// POST /api/tests/:id/start — only allowed once the test is live
router.post('/:id/start', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const status = computeStatus(test);
    if (status === 'upcoming') return res.status(400).json({ error: 'This test has not started yet' });
    if (status === 'closed') return res.status(400).json({ error: 'This test window has closed' });

    let submission = await Submission.findOne({ test: test._id, student: req.user._id });
    if (submission) return res.json(submission); // resuming an already-started attempt

    submission = await Submission.create({
      test: test._id, student: req.user._id, answers: [],
      totalQuestions: test.questions.length, startedAt: new Date()
    });
    res.status(201).json(submission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start test' });
  }
});

// POST /api/tests/:id/submit — grades against the correct answers stored server-side only
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers } = req.body; // [{ questionId, selectedOptionIndex }]
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const submission = await Submission.findOne({ test: test._id, student: req.user._id });
    if (!submission) return res.status(400).json({ error: 'You have not started this test' });
    if (submission.submittedAt) return res.status(400).json({ error: 'You have already submitted this test' });

    let score = 0;
    const answerMap = new Map((answers || []).map(a => [String(a.questionId), a.selectedOptionIndex]));
    test.questions.forEach(q => {
      if (answerMap.get(String(q._id)) === q.correctOptionIndex) score++;
    });

    submission.answers = answers || [];
    submission.score = score;
    submission.submittedAt = new Date();
    await submission.save();

    res.json({ score, totalQuestions: test.questions.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

// GET /api/tests/:id/result — full review with correct answers, only after submitting
router.get('/:id/result', auth, async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    const submission = await Submission.findOne({ test: test._id, student: req.user._id });
    if (!submission || !submission.submittedAt) {
      return res.status(400).json({ error: 'Submit the test first to see results' });
    }

    const answerMap = new Map(submission.answers.map(a => [String(a.questionId), a.selectedOptionIndex]));
    const review = test.questions.map(q => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      yourAnswer: answerMap.has(String(q._id)) ? answerMap.get(String(q._id)) : null
    }));

    res.json({ score: submission.score, totalQuestions: submission.totalQuestions, questions: review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch result' });
  }
});

module.exports = router;
