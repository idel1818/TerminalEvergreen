const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
  const totalCost = db.prepare("SELECT COALESCE(SUM(estimated_cost_usd), 0) as total FROM api_usage WHERE created_at >= datetime('now', 'start of month')").get();

  const byFeature = db.prepare(
    "SELECT feature, SUM(estimated_cost_usd) as cost, SUM(input_tokens) as input_tokens, SUM(output_tokens) as output_tokens, COUNT(*) as calls FROM api_usage WHERE created_at >= datetime('now', 'start of month') GROUP BY feature"
  ).all();

  const byWorkspace = db.prepare(
    `SELECT w.company_name, SUM(a.estimated_cost_usd) as cost
     FROM api_usage a JOIN workspaces w ON a.workspace_id = w.id
     WHERE a.created_at >= datetime('now', 'start of month')
     GROUP BY a.workspace_id`
  ).all();

  const recent = db.prepare(
    "SELECT * FROM api_usage ORDER BY created_at DESC LIMIT 20"
  ).all();

  res.json({
    total_cost_this_month: totalCost.total,
    by_feature: byFeature,
    by_workspace: byWorkspace,
    recent_calls: recent
  });
});

module.exports = router;
