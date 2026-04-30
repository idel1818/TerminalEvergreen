const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../database');

router.get('/', (req, res) => {
  const accounts = db.prepare('SELECT * FROM accounts WHERE workspace_id = ? ORDER BY icp_score DESC').all(req.params.id);
  res.json(accounts);
});

router.post('/', (req, res) => {
  const { name, industry, territory, eng_headcount, icp_score, stage, deal_value, pain_point, use_case, opening_line, lat, lng, tags } = req.body;
  const result = db.prepare(
    `INSERT INTO accounts (workspace_id, name, industry, territory, eng_headcount, icp_score, stage, deal_value, pain_point, use_case, opening_line, lat, lng, tags)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(req.params.id, name, industry, territory, eng_headcount, icp_score, stage || 'Uncontacted', deal_value, pain_point, use_case, opening_line, lat, lng, JSON.stringify(tags || []));

  db.prepare('INSERT INTO activities (workspace_id, type, description) VALUES (?, ?, ?)')
    .run(req.params.id, 'account_added', `Added account: ${name}`);

  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(result.lastInsertRowid);
  res.json(account);
});

router.put('/:accountId', (req, res) => {
  const fields = ['name', 'industry', 'territory', 'eng_headcount', 'icp_score', 'stage', 'deal_value', 'pain_point', 'use_case', 'opening_line', 'lat', 'lng', 'tags'];
  const updates = [];
  const params = [];

  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      params.push(f === 'tags' ? JSON.stringify(req.body[f]) : req.body[f]);
    }
  }
  updates.push("updated_at = datetime('now')");
  params.push(req.params.accountId);

  db.prepare(`UPDATE accounts SET ${updates.join(', ')} WHERE id = ? AND workspace_id = ?`).run(...params, req.params.id);
  const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(req.params.accountId);
  res.json(account);
});

router.delete('/:accountId', (req, res) => {
  db.prepare('DELETE FROM accounts WHERE id = ? AND workspace_id = ?').run(req.params.accountId, req.params.id);
  res.json({ success: true });
});

module.exports = router;
