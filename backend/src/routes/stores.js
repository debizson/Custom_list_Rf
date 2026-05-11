const express = require('express');
const List = require('../models/List');
const Store = require('../models/Store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const stores = await Store.find({ userId: req.user.id }).sort({ name: 1 });
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const store = new Store({ name, userId: req.user.id });
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const store = await Store.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    await List.updateMany({ storeId: store._id }, { storeId: null });
    res.json({ message: 'Store deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
