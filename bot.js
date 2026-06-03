const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join(__dirname, 'config', 'settings.json');
const QR_FILE = path.join(__dirname, 'config', 'qr.json');

// ─── QR Helpers ──────────────────────────────────────────────────────────────
function saveQr(qr) {
  fs.writeFileSync(QR_FILE, JSON.stringify({ qr, updatedAt: Date.now() }, null, 2));
}

function clearQr() {
  if (fs.existsSync(QR_FILE)) {
    fs.unlinkSync(QR_FILE);
  }
}

function loadConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    const defaultConfig = {
      autoReplies: [
        { keyword: "hello", reply: "Hello! 👋 Atul ki taraf se namaste!" },
        { keyword: "hi", reply: "Hi! Kaise ho? 😊" },
        { keyword: "number", reply: "Mera number sirf close friends ko milta hai 😄" }
      ],
      status: {
        busy: false,
        message: "",
        freeAt: ""
      },
      songEnabled: true
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// ─── YouTube Search ──────────────────────────────────────────────────────────
async function searchYouTube(songName) {
  try {
    const searchQuery = encodeURIComponent(songName + ' song');
    const response = await axios.get(
      `https://www.youtube.com/results?search_query=${searchQuery}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );
    
    const html = response.data;
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    
    if (match && match[1]) {
      const videoId = match[1];
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // y2mate download link
      const downloadPage = `https://y2mate.com/youtube/${videoId}`;
      
      return {
        found: true,
        videoId,
        youtubeUrl: videoUrl,
        downloadUrl: downloadPage,
        embedUrl: `https://youtu.be/${videoId}`
      };
    }
    return { found: false };
  } catch (err) {
    console.error('YouTube search error:', err.message);
    return { found: false };
  }
}

// ─── Song detection ──────────────────────────────────────────────────────────
function isSongRequest(message) {
  const lower = message.toLowerCase();
  const songKeywords = ['song', 'gaana', 'gana', 'music', 'track', 'play', 'baja', 'suno', 'download song'];
  return songKeywords.some(kw => lower.includes(kw));
}

function extractSongName(message) {
  const lower = message.toLowerCase();
  // Remove common keywords to get the song name
  let cleaned = lower
    .replace(/song|gaana|gana|music|track|play|baja|suno|download|send|bhejo|dedo|de do/g, '')
    .replace(/ka|ki|ke|mujhe|please|plz|pls/g, '')
    .trim();
  return cleaned || message;
}

// ─── WhatsApp Client ─────────────────────────────────────────────────────────
const authDir = path.join(__dirname, '.wwebjs_auth2');

if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

const puppeteerConfig = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};

const possibleChromePaths = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean);

for (const p of possibleChromePaths) {
  if (fs.existsSync(p)) {
    puppeteerConfig.executablePath = p;
    console.log('Using Chrome executable at', p);
    break;
  }
}

if (!puppeteerConfig.executablePath) {
  console.log('\n⚠️  No local Chrome/Chromium detected.');
  console.log('Install Chrome/Chromium on the server, or set PUPPETEER_EXECUTABLE_PATH.\n');
}

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'client-one',
    dataPath: authDir
  }),
  puppeteer: puppeteerConfig
});


client.on('qr', (qr) => {
  console.log('\n📱 WhatsApp QR Code - Scan karo apne phone se:\n');
  qrcode.generate(qr, { small: true });
  saveQr(qr);
  console.log('\n✅ Yaha tak aao: Settings > Linked Devices > Link a Device\n');
});

client.on('authenticated', () => {
  clearQr();
});

client.on('ready', () => {
  clearQr();
  console.log('✅ WhatsApp Bot Connected! Ready hai Atul bhai!');
  console.log('🌐 Dashboard: http://localhost:3001');
});

client.on('auth_failure', () => {
  clearQr();
  console.log('❌ Auth fail hua. Session delete karo aur dobara try karo.');
});

// ─── Message Handler ─────────────────────────────────────────────────────────
client.on('message', async (msg) => {
  const config = loadConfig();
  const text = msg.body.trim();
  const lowerText = text.toLowerCase();
  const contact = await msg.getContact();
  const name = contact.pushname || contact.number;

  console.log(`📨 [${name}]: ${text}`);

  // Skip group messages (optional - remove if you want group support)
  if (msg.from.includes('@g.us')) return;

  // ── 1. Song Request ────────────────────────────────────────────────────────
  if (config.songEnabled && isSongRequest(lowerText)) {
    const songName = extractSongName(text);
    if (songName.length > 1) {
      await msg.reply(`🎵 Searching for: *${songName}*\n⏳ Ek second...`);
      const result = await searchYouTube(songName);
      
      if (result.found) {
        const reply = 
          `🎵 *${songName.toUpperCase()}*\n\n` +
          `▶️ *YouTube:* ${result.youtubeUrl}\n\n` +
          `⬇️ *Download Link:*\n${result.downloadUrl}\n\n` +
          `💡 _Download link pe jao, MP3/MP4 select karo aur download karo!_`;
        await msg.reply(reply);
      } else {
        await msg.reply(`❌ Song nahi mila: "${songName}". Thoda aur specific name likhna try karo!`);
      }
      return;
    }
  }

  // ── 2. Busy/Status Mode ────────────────────────────────────────────────────
  if (config.status.busy) {
    let statusMsg = `🔴 *${name}*, abhi Atul busy hai!\n\n`;
    statusMsg += `📌 *Status:* ${config.status.message || 'Kaam chal raha hai'}`;
    if (config.status.freeAt) {
      statusMsg += `\n⏰ *Free hoga:* ${config.status.freeAt}`;
    }
    statusMsg += `\n\n_Baad mein reply karega! 🙏_`;
    await msg.reply(statusMsg);
    return;
  }

  // ── 3. Keyword Auto Replies ────────────────────────────────────────────────
  const autoReplies = config.autoReplies || [];
  for (const item of autoReplies) {
    if (lowerText.includes(item.keyword.toLowerCase())) {
      await msg.reply(item.reply);
      return;
    }
  }

  // ── 4. Default (no match) ─────────────────────────────────────────────────
  // Silently ignore if no match (or uncomment below for default reply)
  // await msg.reply("Atul ka bot hai! Abhi offline hai. 🤖");
});

// ─── Start ───────────────────────────────────────────────────────────────────
client.initialize();

module.exports = { loadConfig, saveConfig };
