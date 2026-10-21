import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read backend URL from environment variables, defaulting to the pinned localtunnel URL
const backendUrl = process.env.BACKEND_URL || process.env.VITE_API_URL || 'https://fofa-arena-hub.loca.lt';
const cleanBackendUrl = backendUrl.replace(/\/$/, '');

const content = `# Redirect rules for Netlify
/api/*  ${cleanBackendUrl}/api/:splat  200
/socket.io/*  ${cleanBackendUrl}/socket.io/:splat  200!
/*  /index.html  200
`;

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, '_redirects'), content);
console.log(`[Redirects] Generated public/_redirects pointing to: ${cleanBackendUrl}`);
