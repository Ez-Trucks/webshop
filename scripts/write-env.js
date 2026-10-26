const fs = require('fs');
const path = require('path');
const configured = process.env.EZ_TRUCKS_API_URL?.trim();
let apiUrl;
if (configured) {
  const url = new URL(configured);
  const local = ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.search || url.hash) {
    throw new Error('EZ_TRUCKS_API_URL moet een geldige HTTPS API-URL zijn, zonder credentials, query of fragment.');
  }
  apiUrl = url.toString().replace(/\/$/, '');
}
fs.writeFileSync(path.join(__dirname, '..', 'public', 'ez-config.js'), apiUrl ? `window.__EZ_TRUCKS_API_URL__ = ${JSON.stringify(apiUrl)};\n` : '');
