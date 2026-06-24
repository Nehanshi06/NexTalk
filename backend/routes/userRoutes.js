const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Search users
router.get('/search', protect, async (req, res) => {
  const { q } = req.query;
  try {
    const users = await User.find({
      username: { $regex: q, $options: 'i' },
      _id: { $ne: req.user._id },
    }).select('username avatar isOnline').limit(10);
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Get user profile
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Update profile (bio)
router.put('/profile/update', protect, async (req, res) => {
  try {
    const { bio } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { bio }, { new: true }).select('-password');
    res.json(user);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Upload avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    const avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true }).select('-password');
    res.json({ avatar: user.avatar });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
