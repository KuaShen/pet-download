/**
 * AI 桌宠下载站 — 开发服务器
 *
 * 功能：
 *   - 静态文件服务（HTML / CSS / JS / JSON / 图片等）
 *   - SPA 回退：所有非文件路由均返回 index.html（支持刷新 /pet/:id 这类路径）
 *   - 纯 Node.js 内置模块，零依赖
 *
 * 使用：
 *   node server.js              → http://localhost:3000
 *   node server.js --port 4000  → http://localhost:4000
 *
 * 生产部署（Vercel / GitHub Pages）：
 *   - Vercel：不需要此文件，直接部署，配置 vercel.json 的 rewrites
 *   - GitHub Pages：也不需要，只需确保 404.html 复制 index.html 内容即可
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = parseInt(process.argv.find(a => a.startsWith('--port='))?.split('=')[1], 10) || 3000;
const ROOT = __dirname;

// MIME 类型映射
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
  '.zip':  'application/zip',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];

  // 将 /market /pet/xxx 等 SPA 路径重写到 index.html
  // 规则：如果路径没有文件扩展名，且不是根路径，则视为 SPA 路由
  const ext = path.extname(urlPath);
  if (urlPath !== '/' && !ext) {
    urlPath = '/index.html';
  }

  const filePath = path.join(ROOT, urlPath === '/' ? '/index.html' : urlPath);
  const mime = MIME[path.extname(filePath)] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // 文件不存在 → 回退到 index.html（SPA 支持）
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(ROOT, 'index.html'), (err2, fallback) => {
          if (err2) {
            res.writeHead(500);
            res.end('500 Internal Server Error');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(fallback);
        });
        return;
      }
      res.writeHead(500);
      res.end('500 Internal Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  const addrs = server.address();
  console.log(`\n  🐾  AI 桌宠下载站`);
  console.log(`  ─────────────────`);
  console.log(`  本地:  http://localhost:${addrs.port}`);
  console.log(`  网络:  http://127.0.0.1:${addrs.port}\n`);
  console.log(`  ✨  SPA 路由已启用 — 直接访问 /pet/xxx /market 等路径即可`);
  console.log(`  📝  按 Ctrl+C 停止服务器\n`);
});
