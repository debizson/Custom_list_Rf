const express = require('express');
const Category = require('../models/Category');
const Item = require('../models/Item');
const List = require('../models/List');
const Store = require('../models/Store');
const User = require('../models/User');
const { requireAdmin, requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map((user) => user.toSafeObject()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: 'Admin cannot delete own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const lists = await List.find({ userId: user._id }).select('_id');
    const listIds = lists.map((list) => list._id);

    await Item.deleteMany({ listId: { $in: listIds } });
    await List.deleteMany({ userId: user._id });
    await Category.deleteMany({ userId: user._id });
    await Store.deleteMany({ userId: user._id });

    res.json({ message: 'User and related shopping data deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
