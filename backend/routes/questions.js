const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { auth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = subject ? { subject } : {};
    const questions = await Question.find(filter)
      .populate('askedBy', 'name')
      .populate('answers.answeredBy', 'name')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('askedBy', 'name')
      .populate('answers.answeredBy', 'name');
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(404).json({ error: 'Question not found' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, body, subject, level, classGrade } = req.body;
    if (!title || !subject) return res.status(400).json({ error: 'Title and subject are required' });
    const question = await Question.create({
      title, body: body || '', subject,
      level: level || req.user.level || '',
      classGrade: classGrade || req.user.classGrade || '',
      askedBy: req.user._id
    });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post question' });
  }
});

router.post('/:id/answers', auth, async (req, res) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ error: 'Answer cannot be empty' });

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    question.answers.push({ body, answeredBy: req.user._id });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post answer' });
  }
});

router.patch('/:id/resolve', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    if (String(question.askedBy) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Only the person who asked can mark this resolved' });
    }
    question.resolved = true;
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

module.exports = router;
