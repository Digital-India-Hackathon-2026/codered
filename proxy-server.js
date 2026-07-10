const http = require('http');
const https = require('https');
const url = require('url');

const BACKEND = 'https://healthcare-backend.goshoppie.com';
const PORT = 5000;

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  const options = {
    hostname: 'healthcare-backend.goshoppie.com',
    path: parsed.path,
    method: req.method,
    headers: { ...req.headers, host: 'healthcare-backend.goshoppie.com' },
  };

  const proxy = https.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxy.on('error', (e) => {
    res.writeHead(502);
    res.end(JSON.stringify({ error: e.message }));
  });

  req.pipe(proxy);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Proxy server running at http://0.0.0.0:${PORT}`);
  console.log(`Forwarding to ${BACKEND}`);
});
