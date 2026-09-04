const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

const VALID_ROOMS = ['general', 'school', 'college'];

router.get('/:room', async (req, res) => {
  try {
    const { room } = req.params;
    if (!VALID_ROOMS.includes(room)) return res.status(400).json({ error: 'Unknown room' });

    const messages = await Message.find({ room })
      .populate('sender', 'name role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;
