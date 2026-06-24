const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const tok = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (await User.findOne({ username })) return res.status(400).json({ message: 'Username taken' });
    const user = await User.create({ username, password });
    res.status(201).json({ _id: user._id, username: user.username, avatar: user.avatar, bio: user.bio, token: tok(user._id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ _id: user._id, username: user.username, avatar: user.avatar, bio: user.bio, token: tok(user._id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
