const express = require('express');
const router = express.Router();
const { fetchHackerNews } = require('../services/enrichment');

router.get('/sector', async (req, res) => {
  try {
    const query = req.query.q || 'enterprise software';
    const stories = await fetchHackerNews(query);
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/accounts', async (req, res) => {
  try {
    const query = req.query.q || '';
    if (!query) return res.json([]);
    const stories = await fetchHackerNews(query);
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hiring', async (req, res) => {
  try {
    const query = req.query.q || 'hiring engineering';
    const stories = await fetchHackerNews(query + ' hiring');
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
