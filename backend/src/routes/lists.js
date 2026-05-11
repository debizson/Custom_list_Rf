const express = require('express');
const router = express.Router();
const List = require('../models/List');
const Item = require('../models/Item');
const Category = require('../models/Category');
const Store = require('../models/Store');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

async function findUserList(req, listId) {
  return List.findOne({ _id: listId, userId: req.user.id });
}

async function resolveUserStore(req, storeId) {
  if (!storeId) {
    return null;
  }

  const store = await Store.findOne({ _id: storeId, userId: req.user.id });
  return store ? store._id : undefined;
}

async function resolveUserCategory(req, categoryId) {
  if (!categoryId) {
    return null;
  }

  const category = await Category.findOne({ _id: categoryId, userId: req.user.id });
  return category ? category._id : undefined;
}

// GET /api/lists - Bejelentkezett user listáinak lekérése
router.get('/', async (req, res) => {
  try {
    const lists = await List.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(lists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lists - Új lista létrehozása
router.post('/', async (req, res) => {
  try {
    const { name, storeId } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const resolvedStoreId = await resolveUserStore(req, storeId);
    if (resolvedStoreId === undefined) {
      return res.status(400).json({ error: 'Invalid store' });
    }

    const list = new List({
      name,
      storeId: resolvedStoreId,
      userId: req.user.id
    });
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lists/:id - Egy lista lekérése elemekkel együtt
router.get('/:id', async (req, res) => {
  try {
    const list = await findUserList(req, req.params.id);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    const items = await Item.find({ listId: req.params.id }).sort({ order: 1 });
    res.json({ list, items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/lists/:id - Lista frissítése
router.put('/:id', async (req, res) => {
  try {
    const { name, storeId } = req.body;
    const resolvedStoreId = await resolveUserStore(req, storeId);
    if (resolvedStoreId === undefined) {
      return res.status(400).json({ error: 'Invalid store' });
    }

    const list = await List.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { name, storeId: resolvedStoreId },
      { new: true }
    );
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/lists/:id - Lista törlése (és elemei)
router.delete('/:id', async (req, res) => {
  try {
    const list = await List.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }
    await Item.deleteMany({ listId: req.params.id });
    res.json({ message: 'List and items deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/lists/:listId/reorder - Elemek sorrendjének módosítása (SPECIFIKUS - előbb kell mint az items végpontok)
router.put('/:listId/reorder', async (req, res) => {
  try {
    const { itemIds } = req.body;
    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ error: 'itemIds must be an array' });
    }

    const list = await findUserList(req, req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const items = await Item.find({
      _id: { $in: itemIds },
      listId: req.params.listId
    });

    if (items.length !== itemIds.length) {
      return res.status(400).json({ error: 'Invalid item order payload' });
    }

    const updatePromises = itemIds.map((itemId, index) =>
      Item.findOneAndUpdate(
        { _id: itemId, listId: req.params.listId },
        { order: index },
        { new: true }
      )
    );

    const updatedItems = await Promise.all(updatePromises);
    res.json(updatedItems.sort((first, second) => first.order - second.order));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/lists/:listId/items - Elem lista lekérése (sorrend szerint)
router.get('/:listId/items', async (req, res) => {
  try {
    const list = await findUserList(req, req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const items = await Item.find({ listId: req.params.listId }).sort({ order: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/lists/:listId/items - Új elem hozzáadása
router.post('/:listId/items', async (req, res) => {
  try {
    const { name, quantity, price, categoryId } = req.body;
    if (!name || !quantity) {
      return res.status(400).json({ error: 'Name and quantity are required' });
    }

    const list = await findUserList(req, req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const resolvedCategoryId = await resolveUserCategory(req, categoryId);
    if (resolvedCategoryId === undefined) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const order = await Item.countDocuments({ listId: req.params.listId });
    const item = new Item({
      name,
      quantity,
      price,
      categoryId: resolvedCategoryId,
      order,
      listId: req.params.listId
    });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/lists/:listId/items/:itemId - Elem frissítése
router.put('/:listId/items/:itemId', async (req, res) => {
  try {
    const { name, quantity, price, completed, categoryId } = req.body;
    const list = await findUserList(req, req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const resolvedCategoryId = await resolveUserCategory(req, categoryId);
    if (resolvedCategoryId === undefined) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const item = await Item.findOneAndUpdate(
      { _id: req.params.itemId, listId: req.params.listId },
      { name, quantity, price, completed, categoryId: resolvedCategoryId },
      { new: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/lists/:listId/items/:itemId - Elem törlése
router.delete('/:listId/items/:itemId', async (req, res) => {
  try {
    const list = await findUserList(req, req.params.listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    const item = await Item.findOneAndDelete({
      _id: req.params.itemId,
      listId: req.params.listId
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
