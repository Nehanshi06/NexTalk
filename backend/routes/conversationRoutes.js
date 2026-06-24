const express = require('express');
const Conversation = require('../models/Conversation');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const convos = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'username avatar isOnline lastSeen')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username' } })
      .sort({ lastMessageAt: -1 });
    res.json(convos);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/open', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    let convo = await Conversation.findOne({ participants: { $all: [req.user._id, userId], $size: 2 } })
      .populate('participants', 'username avatar isOnline lastSeen')
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username' } });
    if (!convo) {
      convo = await Conversation.create({ participants: [req.user._id, userId] });
      convo = await Conversation.findById(convo._id)
        .populate('participants', 'username avatar isOnline lastSeen')
        .populate({ path: 'lastMessage', populate: { path: 'sender', select: 'username' } });
    }
    res.json(convo);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
