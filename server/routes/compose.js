const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../database');
const { composeOutreach, researchAccount } = require('../services/claude');

router.post('/compose', async (req, res) => {
  try {
    const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.params.id);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const config = JSON.parse(workspace.config_json);
    const { account_name, persona, channel } = req.body;

    const result = await composeOutreach(config, account_name || 'Target Account', persona, channel);

    const inputTokens = 500;
    const outputTokens = 300;
    const costUsd = (inputTokens * 3 / 1000000) + (outputTokens * 15 / 1000000);
    db.prepare('INSERT INTO api_usage (workspace_id, feature, input_tokens, output_tokens, estimated_cost_usd) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, 'compose_outreach', inputTokens, outputTokens, costUsd);

    res.json(result);
  } catch (err) {
    console.error('Compose error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/research', async (req, res) => {
  try {
    const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.params.id);
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const config = JSON.parse(workspace.config_json);
    const { account_name } = req.body;

    const result = await researchAccount(config, account_name);

    const inputTokens = 300;
    const outputTokens = 500;
    const costUsd = (inputTokens * 3 / 1000000) + (outputTokens * 15 / 1000000);
    db.prepare('INSERT INTO api_usage (workspace_id, feature, input_tokens, output_tokens, estimated_cost_usd) VALUES (?, ?, ?, ?, ?)')
      .run(req.params.id, 'account_research', inputTokens, outputTokens, costUsd);

    res.json(result);
  } catch (err) {
    console.error('Research error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
