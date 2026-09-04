const Notification = require('../models/Notification');

async function notify(userId, message, type = 'general', testId = null) {
  try {
    await Notification.create({ user: userId, message, type, test: testId });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

module.exports = { notify };
