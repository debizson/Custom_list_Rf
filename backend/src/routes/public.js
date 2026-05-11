const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function orderedByPrice(occurrences) {
  if (occurrences.length < 2) {
    return occurrences.map((occurrence, index) => ({
      ...occurrence,
      priceRank: index === 0 ? 'highest' : 'normal'
    }));
  }

  const sortedByPrice = [...occurrences].sort((first, second) => {
    if (second.price !== first.price) {
      return second.price - first.price;
    }

    return first.storeName.localeCompare(second.storeName);
  });

  const highest = sortedByPrice[0];
  const lowestIndex = sortedByPrice.reduce((lowest, occurrence, index) => {
    if (occurrence.price < sortedByPrice[lowest].price) {
      return index;
    }

    return lowest;
  }, 0);
  const lowest = sortedByPrice[lowestIndex];
  const rest = sortedByPrice.filter(
    (occurrence) => occurrence._id !== highest._id && occurrence._id !== lowest._id
  );

  return [
    { ...highest, priceRank: 'highest' },
    { ...lowest, priceRank: 'lowest' },
    ...rest.map((occurrence) => ({ ...occurrence, priceRank: 'normal' }))
  ];
}

router.get('/products/suggestions', async (req, res) => {
  try {
    const query = String(req.query.query || '').trim();

    if (!query) {
      return res.json([]);
    }

    const suggestions = await Item.aggregate([
      {
        $match: {
          name: { $regex: escapeRegex(query), $options: 'i' }
        }
      },
      {
        $group: {
          _id: { $toLower: '$name' },
          name: { $first: '$name' },
          count: { $sum: 1 }
        }
      },
      { $sort: { name: 1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          name: 1,
          count: 1
        }
      }
    ]);

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/products/compare', async (req, res) => {
  try {
    const query = String(req.query.query || '').trim();

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const occurrences = await Item.aggregate([
      {
        $match: {
          name: { $regex: `^${escapeRegex(query)}$`, $options: 'i' }
        }
      },
      {
        $lookup: {
          from: 'lists',
          localField: 'listId',
          foreignField: '_id',
          as: 'list'
        }
      },
      { $unwind: '$list' },
      {
        $lookup: {
          from: 'stores',
          localField: 'list.storeId',
          foreignField: '_id',
          as: 'store'
        }
      },
      {
        $unwind: {
          path: '$store',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: { $toString: '$_id' },
          productName: '$name',
          price: { $ifNull: ['$price', 0] },
          quantity: '$quantity',
          listName: '$list.name',
          storeName: { $ifNull: ['$store.name', 'Nincs bolt'] },
          createdAt: 1
        }
      }
    ]);

    res.json({
      query,
      productName: occurrences[0]?.productName || query,
      totalOccurrences: occurrences.length,
      occurrences: orderedByPrice(occurrences)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
