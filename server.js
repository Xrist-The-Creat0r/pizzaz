const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

const MENU_PATH = path.join(__dirname, 'shared', 'menu.json');
const IMAGES_DIR = path.join(__dirname, 'shared', 'images');

if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const storage = multer.diskStorage({
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

app.use('/shared', express.static(path.join(__dirname, 'shared')));
app.use('/menu', express.static(path.join(__dirname, 'menu')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.get('/', (req, res) => res.redirect('/menu'));

app.get('/api/menu', (req, res) => {
  try {
    const data = fs.readFileSync(MENU_PATH, 'utf8');
    res.json(JSON.parse(data));
  } catch {
    res.json([]);
  }
});

app.post('/api/menu', (req, res) => {
  try {
    fs.writeFileSync(MENU_PATH, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename });
});

app.listen(PORT, () => {
  console.log(`Pizzeria server running at http://localhost:${PORT}`);
  console.log(`  Menu:  http://localhost:${PORT}/menu`);
  console.log(`  Admin: http://localhost:${PORT}/admin`);
});
