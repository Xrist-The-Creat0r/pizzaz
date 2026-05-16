# Pizzeria Web App

Two connected sites — a customer-facing menu and an admin dashboard — powered by a single `menu.json` file and a Node.js/Express server.

## Setup

```bash
cd pizzaz
npm install express multer
node server.js
```

Then open:

| URL | Description |
|-----|-------------|
| http://localhost:3000/menu | Customer menu |
| http://localhost:3000/admin | Admin dashboard |

## Project structure

```
pizzaz/
├── server.js          # Express server (port 3000)
├── menu/
│   └── index.html     # Customer-facing menu site
├── admin/
│   └── index.html     # Admin dashboard
├── shared/
│   ├── menu.json      # Single source of truth
│   └── images/        # Pizza images (uploaded via admin)
└── README.md
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/menu | Returns menu.json as JSON |
| POST | /api/menu | Overwrites menu.json with request body |
| POST | /api/upload | Uploads image to shared/images/, returns `{ filename }` |

## Adding pizza images

Place images in `shared/images/` named to match the `image` field in `menu.json` (e.g. `caesar.jpg`), or upload them directly via the admin dashboard.

## Admin usage

- **Drag ⠿⠿** handle to reorder cards
- **Click any field** (name, description, badge) to edit inline
- **Click the image** area to upload a new photo
- **+ Add size / ✕** to manage size/price rows
- **🗑 Delete** button removes a pizza (with confirmation)
- **+ Add New Pizza** button opens the creation modal
- **💾 Save Changes** writes all edits back to `menu.json`
