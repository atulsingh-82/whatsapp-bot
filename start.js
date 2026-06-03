const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Atul\'s WhatsApp Bot starting...\n');

// Start Dashboard Server
const dashboard = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

// Start WhatsApp Bot (slight delay)
setTimeout(() => {
  const bot = spawn('node', ['bot.js'], {
    cwd: __dirname,
    stdio: 'inherit'
  });

  bot.on('exit', (code) => {
    console.log(`Bot exited with code ${code}`);
    dashboard.kill();
    process.exit(code);
  });
}, 1000);

process.on('SIGINT', () => {
  console.log('\n👋 Bot band ho raha hai...');
  dashboard.kill();
  process.exit(0);
});
