const express = require('express');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Get messages for a conversation
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Mark messages as seen
router.put('/:conversationId/seen', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { conversationId: req.params.conversationId, sender: { $ne: req.user._id }, seen: false },
      { seen: true, seenAt: new Date() }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Upload image for message
router.post('/upload-image', protect, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
