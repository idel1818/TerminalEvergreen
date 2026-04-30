const express = require('express');
const router = express.Router({ mergeParams: true });
const db = require('../database');
const multer = require('multer');
const { extractDocument } = require('../services/claude');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

function parseCSVRow(row) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (inQuotes) {
      if (ch === '"' && row[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

const uploadDir = path.join(__dirname, '..', '..', 'data', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'))
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/integrations/hubspot', (req, res) => {
  const { api_key } = req.body;
  const existing = db.prepare('SELECT * FROM integrations WHERE workspace_id = ? AND type = ?').get(req.params.id, 'hubspot');
  if (existing) {
    db.prepare('UPDATE integrations SET config_json = ?, status = ? WHERE id = ?')
      .run(JSON.stringify({ api_key }), 'connected', existing.id);
  } else {
    db.prepare('INSERT INTO integrations (workspace_id, type, config_json, status) VALUES (?, ?, ?, ?)')
      .run(req.params.id, 'hubspot', JSON.stringify({ api_key }), 'connected');
  }
  res.json({ success: true, status: 'connected' });
});

router.get('/integrations', (req, res) => {
  const integrations = db.prepare('SELECT * FROM integrations WHERE workspace_id = ?').all(req.params.id);
  res.json(integrations.map(i => ({
    ...i,
    config_json: i.config_json ? JSON.stringify(
      Object.fromEntries(Object.entries(JSON.parse(i.config_json)).map(([k, v]) =>
        [k, typeof v === 'string' && k.toLowerCase().includes('key') ? v.slice(0, 4) + '****' : v]
      ))
    ) : i.config_json
  })));
});

router.post('/import/sheets', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    let csvUrl = url;
    if (url.includes('docs.google.com/spreadsheets') && !url.includes('/pub')) {
      const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match) csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/pub?output=csv`;
    }

    if (!csvUrl.startsWith('https://docs.google.com/spreadsheets/')) {
      return res.status(400).json({ error: 'Only Google Sheets URLs are supported' });
    }

    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error('Failed to fetch sheet');
    const csvText = await response.text();

    const lines = csvText.split('\n').filter(l => l.trim());
    if (lines.length < 2) return res.status(400).json({ error: 'No data rows found' });

    const headers = parseCSVRow(lines[0]).map(h => h.toLowerCase());
    const nameIdx = headers.findIndex(h => h.includes('company') || h.includes('name'));
    const industryIdx = headers.findIndex(h => h.includes('industry'));
    const territoryIdx = headers.findIndex(h => h.includes('territory') || h.includes('region'));
    const notesIdx = headers.findIndex(h => h.includes('notes') || h.includes('pain'));

    let imported = 0;
    const insertAccount = db.prepare(
      `INSERT INTO accounts (workspace_id, name, industry, territory, pain_point, stage) VALUES (?, ?, ?, ?, ?, 'Uncontacted')`
    );

    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVRow(lines[i]);
      const name = nameIdx >= 0 ? cols[nameIdx] : cols[0];
      if (!name) continue;

      insertAccount.run(
        req.params.id,
        name,
        industryIdx >= 0 ? cols[industryIdx] : null,
        territoryIdx >= 0 ? cols[territoryIdx] : null,
        notesIdx >= 0 ? cols[notesIdx] : null
      );
      imported++;
    }

    db.prepare('INSERT INTO activities (workspace_id, type, description) VALUES (?, ?, ?)')
      .run(req.params.id, 'sheets_import', `Imported ${imported} accounts from Google Sheets`);

    res.json({ success: true, imported });
  } catch (err) {
    console.error('Sheets import error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload/document', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let content = '';
    try {
      if (req.file.originalname.endsWith('.pdf') || req.file.mimetype === 'application/pdf') {
        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        content = pdfData.text;
      } else {
        content = fs.readFileSync(req.file.path, 'utf-8');
      }
    } catch (parseErr) {
      fs.unlink(req.file.path, () => {});
      throw parseErr;
    }

    let extractResult;
    try {
      extractResult = await extractDocument(content);
    } finally {
      fs.unlink(req.file.path, () => {});
    }
    const extracted = extractResult.result || extractResult;

    const workspace = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(req.params.id);
    if (workspace) {
      const config = JSON.parse(workspace.config_json);

      if (extracted.selling_points) {
        config.selling_points = [...(config.selling_points || []), ...extracted.selling_points];
      }
      if (extracted.objections) {
        config.objections = [...(config.objections || []), ...extracted.objections];
      }
      if (extracted.competitors) {
        config.competitors = [...(config.competitors || []), ...extracted.competitors.map(c => ({
          ...c, valuation: '', arr: '', status: 'losing', status_label: 'New', battlecard: {
            their_strength: c.differentiator || '', their_weakness: '', one_line_response: c.our_advantage || ''
          }
        }))];
      }

      db.prepare('UPDATE workspaces SET config_json = ?, updated_at = datetime(\'now\') WHERE id = ?')
        .run(JSON.stringify(config), req.params.id);
    }

    db.prepare('INSERT INTO activities (workspace_id, type, description) VALUES (?, ?, ?)')
      .run(req.params.id, 'document_upload', `Processed document: ${req.file.originalname}`);

    if (extractResult._usage) {
      db.prepare('INSERT INTO api_usage (workspace_id, feature, input_tokens, output_tokens, estimated_cost_usd) VALUES (?, ?, ?, ?, ?)')
        .run(req.params.id, 'document_extract', extractResult._usage.inputTokens, extractResult._usage.outputTokens, extractResult._usage.costUsd);
    }

    res.json({ success: true, extracted });
  } catch (err) {
    console.error('Document upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
