require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/workspaces', require('./routes/workspaces'));
app.use('/api/workspaces/:id/accounts', require('./routes/accounts'));
app.use('/api/workspaces/:id/outreach', require('./routes/outreach'));
app.use('/api/workspaces/:id', require('./routes/compose'));
app.get('/api/workspaces/:id/activities', (req, res) => {
  const db = require('./database');
  const activities = db.prepare('SELECT * FROM activities WHERE workspace_id = ? ORDER BY created_at DESC LIMIT 20').all(req.params.id);
  res.json(activities);
});
app.use('/api/workspaces/:id/settings', require('./routes/settings'));
app.use('/api/intelligence', require('./routes/intelligence'));
app.use('/api/usage', require('./routes/usage'));

const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`GTM Terminal running on port ${PORT}`);
});
