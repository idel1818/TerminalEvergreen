const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../database');
const { composeOutreach } = require('../services/claude');

router.get('/', (req, res) => {
  const outreach = db.prepare('SELECT * FROM outreach WHERE workspace_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json(outreach);
});

router.post('/', (req, res) => {
  const { account_id, contact_id, channel, subject, message, status, follow_up_date } = req.body;
  const result = db.prepare(
    `INSERT INTO outreach (workspace_id, account_id, contact_id, channel, date_sent, subject, message, status, follow_up_date)
     VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, ?)`
  ).run(req.params.id, account_id, contact_id, channel || 'email', subject, message, status || 'Sent', follow_up_date);

  db.prepare('INSERT INTO activities (workspace_id, account_id, type, description) VALUES (?, ?, ?, ?)')
    .run(req.params.id, account_id, 'outreach_sent', `Sent ${channel || 'email'}: ${subject}`);

  const item = db.prepare('SELECT * FROM outreach WHERE id = ?').get(result.lastInsertRowid);
  res.json(item);
});

router.put('/:outreachId', (req, res) => {
  const fields = ['status', 'response_notes', 'follow_up_date'];
  const updates = [];
  const params = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      params.push(req.body[f]);
    }
  }
  params.push(req.params.outreachId);
  if (updates.length > 0) {
    db.prepare(`UPDATE outreach SET ${updates.join(', ')} WHERE id = ? AND workspace_id = ${req.params.id}`).run(...params);
  }
  const item = db.prepare('SELECT * FROM outreach WHERE id = ?').get(req.params.outreachId);
  res.json(item);
});

module.exports = router;
