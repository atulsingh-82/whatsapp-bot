const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const app = express();

const CONFIG_FILE = path.join(__dirname, 'config', 'settings.json');
const QR_FILE = path.join(__dirname, 'config', 'qr.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dashboard')));

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Get full config
app.get('/api/config', (req, res) => {
  res.json(loadConfig());
});

app.get('/api/qr', async (req, res) => {
  if (!fs.existsSync(QR_FILE)) {
    return res.json({ available: false });
  }

  try {
    const qrData = JSON.parse(fs.readFileSync(QR_FILE, 'utf-8'));
    const dataUrl = await QRCode.toDataURL(qrData.qr);
    return res.json({ available: true, dataUrl, updatedAt: qrData.updatedAt });
  } catch (err) {
    console.error('QR API error:', err);
    return res.status(500).json({ available: false, error: 'QR read failed' });
  }
});

// Update status
app.post('/api/status', (req, res) => {
  const config = loadConfig();
  const { busy, message, freeAt } = req.body;
  config.status = { busy, message: message || '', freeAt: freeAt || '' };
  saveConfig(config);
  res.json({ success: true, status: config.status });
});

// Add auto reply
app.post('/api/replies', (req, res) => {
  const config = loadConfig();
  const { keyword, reply } = req.body;
  if (!keyword || !reply) return res.status(400).json({ error: 'Keyword aur reply dono chahiye' });
  
  config.autoReplies = config.autoReplies || [];
  
  // Check duplicate
  const exists = config.autoReplies.findIndex(r => r.keyword.toLowerCase() === keyword.toLowerCase());
  if (exists >= 0) {
    config.autoReplies[exists].reply = reply;
  } else {
    config.autoReplies.push({ keyword, reply });
  }
  saveConfig(config);
  res.json({ success: true, autoReplies: config.autoReplies });
});

// Delete auto reply
app.delete('/api/replies/:index', (req, res) => {
  const config = loadConfig();
  const index = parseInt(req.params.index);
  config.autoReplies = config.autoReplies || [];
  if (index >= 0 && index < config.autoReplies.length) {
    config.autoReplies.splice(index, 1);
    saveConfig(config);
    res.json({ success: true, autoReplies: config.autoReplies });
  } else {
    res.status(400).json({ error: 'Invalid index' });
  }
});

// Toggle song feature
app.post('/api/song-toggle', (req, res) => {
  const config = loadConfig();
  config.songEnabled = req.body.enabled;
  saveConfig(config);
  res.json({ success: true, songEnabled: config.songEnabled });
});

app.listen(3001, () => {
  console.log('🌐 Dashboard ready at http://localhost:3001');
});
