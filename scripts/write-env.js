const fs = require('fs');
const path = require('path');

const apiUrl = process.env.EZ_TRUCKS_API_URL || 'http://localhost:3000';
const target = path.join(__dirname, '..', 'public', 'env.js');

fs.writeFileSync(
  target,
  `window.__EZ_TRUCKS_API_URL__ = ${JSON.stringify(apiUrl)};\n`,
);
