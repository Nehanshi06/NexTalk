const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all users (for People suggestions)
router.get('/', protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('username avatar isOnline lastSeen bio').limit(50);
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Search users
router.get('/search', protect, async (req, res) => {
  try {
    const users = await User.find({ username: { $regex: req.query.q, $options: 'i' }, _id: { $ne: req.user._id } })
      .select('username avatar isOnline').limit(10);
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Update profile
router.put('/profile/update', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { bio: req.body.bio }, { new: true }).select('-password');
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Upload avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    const avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true }).select('-password');
    res.json({ avatar: user.avatar });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
