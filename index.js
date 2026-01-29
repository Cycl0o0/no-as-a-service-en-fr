const express = require('express');
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const fs = require('fs');

const app = express();
app.use(cors());
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Load reasons from JSON (English and French)
const reasons = {
  en: JSON.parse(fs.readFileSync('./reasons.json', 'utf-8')),
  fr: JSON.parse(fs.readFileSync('./reasons.fr.json', 'utf-8'))
};

// Rate limiter: 120 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  keyGenerator: (req, res) => {
    return req.headers['cf-connecting-ip'] || req.ip; // Fallback if header missing (or for non-CF)
  },
  message: { error: "Too many requests, please try again later. / Trop de requêtes, veuillez réessayer plus tard. (120 reqs/min/IP)" }
});

app.use(limiter);

// Random rejection reason endpoint
// Use ?lang=fr for French, defaults to English
app.get('/no', (req, res) => {
  const lang = req.query.lang === 'fr' ? 'fr' : 'en';
  const reasonList = reasons[lang];
  const reason = reasonList[Math.floor(Math.random() * reasonList.length)];
  res.json({ reason, lang });
});

// Start server
app.listen(PORT, () => {
  console.log(`No-as-a-Service is running on port ${PORT}`);
});
