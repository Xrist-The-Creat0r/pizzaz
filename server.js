const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_VERCEL = !!process.env.VERCEL;

const MENU_PATH = path.join(__dirname, 'shared', 'menu.json');
const IMAGES_DIR = path.join(__dirname, 'shared', 'images');

// On Vercel the filesystem is read-only outside /tmp, so guard mkdir
if (!IS_VERCEL && !fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// In-memory store used when running on a read-only filesystem (Vercel).
// NOTE: this is per-instance and resets on cold start. For true persistence
// on Vercel, swap this for a real database or blob store.
let memoryMenu = null;

const storage = IS_VERCEL
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, IMAGES_DIR),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const base = path.basename(file.originalname, ext)
          .toLowerCase().replace(/[^a-z0-9]/g, '-');
        cb(null, `${base}-${Date.now()}${ext}`);
      }
    });
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(express.json({ limit: '5mb' }));

// Static assets — Vercel serves these via routes in vercel.json, but the
// middleware below makes local dev work identically.
app.use('/shared', express.static(path.join(__dirname, 'shared')));
app.use('/menu',   express.static(path.join(__dirname, 'menu')));
app.use('/admin',  express.static(path.join(__dirname, 'admin')));

app.get('/', (req, res) => res.redirect('/menu'));

app.get('/api/menu', (req, res) => {
  if (memoryMenu) return res.json(memoryMenu);
  try {
    const data = fs.readFileSync(MENU_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});

app.post('/api/menu', (req, res) => {
  if (IS_VERCEL) {
    // Read-only filesystem — keep changes in memory for this instance.
    memoryMenu = req.body;
    return res.json({
      ok: true,
      ephemeral: true,
      warning: 'Saved in memory only. Vercel filesystem is read-only — changes do not persist across deploys or cold starts.'
    });
  }
  try {
    fs.writeFileSync(MENU_PATH, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  if (IS_VERCEL) {
    return res.status(501).json({
      error: 'Image upload is disabled on Vercel (read-only filesystem). Add the image to /shared/images in the repo and redeploy, or wire up a blob/storage service.'
    });
  }
  res.json({ filename: req.file.filename });
});

// Only start a listener when running locally — on Vercel the platform
// invokes the exported app as a serverless function.
if (!IS_VERCEL) {
  app.listen(PORT, () => {
    console.log(`Pizzeria server running at http://localhost:${PORT}`);
    console.log(`  Menu:  http://localhost:${PORT}/menu`);
    console.log(`  Admin: http://localhost:${PORT}/admin`);
  });
}

module.exports = app;
