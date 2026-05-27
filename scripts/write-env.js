const fs = require('fs');
const path = require('path');

const apiUrl = process.env.EZ_TRUCKS_API_URL;
const target = path.join(__dirname, '..', 'public', 'ez-config.js');

fs.writeFileSync(
  target,
  apiUrl ? `window.__EZ_TRUCKS_API_URL__ = ${JSON.stringify(apiUrl)};\n` : '',
);
