const express = require('express');
const router = express.Router();
const db = require('../database');
const { gatherCompanyData } = require('../services/enrichment');
const { generateConfig } = require('../services/claude');

router.post('/configure', async (req, res) => {
  try {
    const { company_name, force_refresh } = req.body;
    if (!company_name) return res.status(400).json({ error: 'company_name required' });

    if (!force_refresh) {
      const existing = db.prepare('SELECT * FROM workspaces WHERE company_name = ? COLLATE NOCASE ORDER BY updated_at DESC LIMIT 1').get(company_name);
      if (existing) {
        const config = JSON.parse(existing.config_json);
        return res.json({ workspace: existing, config, cached: true });
      }
    }

    const companyData = await gatherCompanyData(company_name);

    let workspaceId;
    let isUpdate = false;
    const existing = force_refresh
      ? db.prepare('SELECT * FROM workspaces WHERE company_name = ? COLLATE NOCASE ORDER BY updated_at DESC LIMIT 1').get(company_name)
      : null;

    if (existing) {
      workspaceId = existing.id;
      isUpdate = true;
      db.prepare('UPDATE workspaces SET domain = ?, logo_url = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(companyData.domain, companyData.logo_url, workspaceId);
    }

    let config;
    try {
      config = await generateConfig(companyData);
    } catch (genErr) {
      // If we haven't created a workspace row yet, just re-throw
      // If we updated an existing one, that's fine — original data is preserved
      throw genErr;
    }

    // Extract usage metadata before storing config
    const usage = config._usage;
    delete config._usage;

    // Only create the workspace row after config generation succeeds
    if (!existing) {
      const insertResult = db.prepare(
        'INSERT INTO workspaces (company_name, domain, logo_url, config_json) VALUES (?, ?, ?, ?)'
      ).run(company_name, companyData.domain, companyData.logo_url, JSON.stringify(config));
      workspaceId = insertResult.lastInsertRowid;
    } else {
      db.prepare('UPDATE workspaces SET config_json = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(JSON.stringify(config), workspaceId);
    }

    if (isUpdate) {
      db.prepare('DELETE FROM accounts WHERE workspace_id = ?').run(workspaceId);
    }

    if (config.target_accounts && config.target_accounts.length > 0) {
      const insertAccount = db.prepare(
        `INSERT INTO accounts (workspace_id, name, industry, territory, eng_headcount, icp_score, pain_point, use_case, opening_line, lat, lng)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      const insertMany = db.transaction((accounts) => {
        for (const a of accounts) {
          insertAccount.run(
            workspaceId, a.name, a.industry, a.territory,
            a.eng_headcount, a.icp_score, a.pain_point, a.use_case,
            a.opening_line, a.lat, a.lng
          );
        }
      });
      insertMany(config.target_accounts);
    }

    // Log API usage with the actual workspace ID now that it exists
    if (usage) {
      db.prepare('INSERT INTO api_usage (workspace_id, feature, input_tokens, output_tokens, estimated_cost_usd) VALUES (?, ?, ?, ?, ?)')
        .run(workspaceId, 'workspace_configure', usage.inputTokens, usage.outputTokens, usage.costUsd);
    }

    db.prepare('INSERT INTO activities (workspace_id, type, description) VALUES (?, ?, ?)')
      .run(workspaceId, isUpdate ? 'workspace_reconfigured' : 'workspace_configured', `Terminal ${isUpdate ? 'reconfigured' : 'configured'} for ${company_name}`);

    const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(workspaceId);
    res.json({ workspace, config, cached: false });
  } catch (err) {
    console.error('Configure error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', (req, res) => {
  const workspaces = db.prepare('SELECT id, company_name, domain, logo_url, created_at, updated_at FROM workspaces ORDER BY updated_at DESC').all();
  res.json(workspaces);
});

router.get('/:id', (req, res) => {
  const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.params.id);
  if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
  const config = JSON.parse(workspace.config_json);
  res.json({ workspace, config });
});

router.put('/:id', (req, res) => {
  const { config_json, company_name, domain, logo_url } = req.body;
  const updates = [];
  const params = [];

  if (config_json) { updates.push('config_json = ?'); params.push(typeof config_json === 'string' ? config_json : JSON.stringify(config_json)); }
  if (company_name) { updates.push('company_name = ?'); params.push(company_name); }
  if (domain) { updates.push('domain = ?'); params.push(domain); }
  if (logo_url !== undefined) { updates.push('logo_url = ?'); params.push(logo_url); }

  updates.push("updated_at = datetime('now')");
  params.push(req.params.id);

  db.prepare(`UPDATE workspaces SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.params.id);
  res.json({ workspace, config: JSON.parse(workspace.config_json) });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM accounts WHERE workspace_id = ?').run(req.params.id);
  db.prepare('DELETE FROM contacts WHERE workspace_id = ?').run(req.params.id);
  db.prepare('DELETE FROM outreach WHERE workspace_id = ?').run(req.params.id);
  db.prepare('DELETE FROM activities WHERE workspace_id = ?').run(req.params.id);
  db.prepare('DELETE FROM api_usage WHERE workspace_id = ?').run(req.params.id);
  db.prepare('DELETE FROM integrations WHERE workspace_id = ?').run(req.params.id);
  db.prepare('DELETE FROM workspaces WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
