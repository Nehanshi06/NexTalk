const express = require('express');
const Story = require('../models/Story');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all active stories (not expired)
router.get('/', protect, async (req, res) => {
  try {
    const stories = await Story.find({ expiresAt: { $gt: new Date() } })
      .populate('user', 'username avatar').sort({ createdAt: -1 });
    // Group by user
    const grouped = {};
    stories.forEach(s => {
      const uid = s.user._id.toString();
      if (!grouped[uid]) grouped[uid] = { user: s.user, stories: [] };
      grouped[uid].stories.push(s);
    });
    res.json(Object.values(grouped));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Post a story
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const story = await Story.create({
      user: req.user._id,
      image: `http://localhost:5000/uploads/${req.file.filename}`,
      caption: req.body.caption || '',
    });
    const populated = await Story.findById(story._id).populate('user', 'username avatar');
    res.status(201).json(populated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Mark story as viewed
router.post('/:storyId/view', protect, async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.storyId, { $addToSet: { viewers: req.user._id } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
