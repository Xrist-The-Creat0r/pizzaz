const fs = require('fs');
const path = require('path');

// Per-instance in-memory store. Netlify's filesystem is read-only,
// so writes don't persist across cold starts / deploys.
let memoryMenu = null;

const MENU_PATH = path.join(process.cwd(), 'shared', 'menu.json');

function readMenuFromDisk() {
  try {
    return JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'));
  } catch {
    return [];
  }
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  if (event.httpMethod === 'GET') {
    const data = memoryMenu || readMenuFromDisk();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  }

  if (event.httpMethod === 'POST') {
    try {
      memoryMenu = JSON.parse(event.body || '[]');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          ephemeral: true,
          warning: 'Saved in memory only — Netlify filesystem is read-only. Edits will be lost on next deploy / cold start.'
        })
      };
    } catch (err) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
};
