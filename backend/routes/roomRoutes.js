const express = require('express');
const Room = require('../models/Room');
const { protect } = require('../middleware/auth');

const router = express.Router();

// GET /api/rooms
router.get('/', protect, async (req, res) => {
  try {
    const rooms = await Room.find().populate('members', 'username isOnline');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/rooms
router.post('/', protect, async (req, res) => {
  const { name } = req.body;
  try {
    const exists = await Room.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Room already exists' });

    const room = await Room.create({ name, members: [req.user._id] });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
