// Kalissa Nail Art - basit statik sunucu (bagimliliksiz)
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5600;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4'
};

const server = http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Gecersiz istek');
  }
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(PUBLIC_DIR, urlPath);

  // public disina cikma girisimlerini engelle
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Yasak');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // dosya istekleri (uzantili yollar) 404 doner; sayfa yollari anasayfaya doner
      if (path.extname(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('Bulunamadi');
      }
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, home) => {
        if (err2) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('Bulunamadi');
        }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(home);
      });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Kalissa Nail Art sitesi calisiyor: http://localhost:${PORT}`);
});
