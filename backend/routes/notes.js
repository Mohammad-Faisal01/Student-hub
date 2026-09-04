const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const upload = require('../middleware/upload');
const { auth } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = subject ? { subject } : {};
    const notes = await Note.find(filter).populate('uploadedBy', 'name').sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, topic, description, level, classGrade } = req.body;
    if (!title || !subject) return res.status(400).json({ error: 'Title and subject are required' });

    const note = await Note.create({
      title, subject, topic: topic || '', description: description || '',
      level: level || req.user.level || '',
      classGrade: classGrade || req.user.classGrade || '',
      file: req.file ? req.file.filename : null,
      uploadedBy: req.user._id
    });
    res.status(201).json(note);
  } catch (err) {
    if (err.message.includes('Only PDF')) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Failed to upload note' });
  }
});

router.patch('/:id/download', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, { $inc: { downloads: 1 } }, { new: true });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update download count' });
  }
});

module.exports = router;
