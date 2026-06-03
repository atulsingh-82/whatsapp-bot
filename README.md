# 🤖 Atul's WhatsApp Bot

## ✅ Features
- 🔁 **Auto Reply** — Custom keywords pe custom replies
- 🔴 **Busy Mode** — Status set karo, auto reply jayega
- 📱 **Phone Dashboard** — Phone se status update karo
- 🎵 **Song Search** — YouTube link + download page

---

## 🚀 Setup (Step by Step)

### Step 1 — Node.js install karo
https://nodejs.org pe jao, LTS version download karo

### Step 2 — Dependencies install karo
```bash
cd whatsapp-bot
npm install
```
> ⚠️ Pehli baar 2-3 minute lagenge (chromium download hoga)

### Step 3 — Bot start karo
```bash
npm start
```

### Step 4 — WhatsApp Link karo
- Terminal mein QR code aayega
- WhatsApp kholo → Settings → Linked Devices → Link a Device
- QR scan karo

### Step 5 — Dashboard kholo (phone pe)
```
http://localhost:3001
```
> Same WiFi pe hona chahiye phone aur laptop dono

---

## 📱 Dashboard Use Karna

### Status Tab
- **Busy Mode ON** karo → koi bhi message kare to busy reply jayega
- **Quick buttons** — Coding, Study, Sleeping, Eating
- Custom message aur "free honga" time daal sakte ho

### Replies Tab
- Naya keyword + reply add karo
- Existing replies delete karo

### Settings Tab
- Song feature ON/OFF karo

---

## 🎵 Song Feature Kaise Kaam Karta Hai

Koi bhi message mein yeh words ho:
`song, gaana, gana, music, play, baja, suno`

Bot reply karega:
```
🎵 SONG NAME
▶️ YouTube: https://youtube.com/watch?v=...
⬇️ Download: https://y2mate.com/...
```

---

## ⚠️ Important Notes

1. **Laptop ON rehna chahiye** jab bot chal raha ho
2. **Internet connection** zaroori hai
3. WhatsApp Web se linked rahega — phone pe notification nahi aayega
4. First time setup mein thoda time lagta hai (chromium download)

---

## 🛠️ Troubleshooting

**QR code nahi aa raha?**
```bash
rm -rf .wwebjs_auth
npm start
```

**Bot band ho gaya?**
```bash
npm start
```
(Dobara QR nahi chahiye — session saved rehta hai)

---

Made with ❤️ for Atul Singh
