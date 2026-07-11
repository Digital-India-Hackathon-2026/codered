export const config = { api: { bodyParser: true } };

const TARGETS = {
  ai: 'https://askfirst.co/api/ai',
  main: 'https://askfirst.co/api/main',
  upload: 'https://healthcare-backend.goshoppie.com/api/upload',
  public: 'https://healthcare-backend.goshoppie.com/api/public',
};

export default async function handler(req, res) {
  const { service, path } = req.query;
  const target = TARGETS[service];

  if (!target) {
    return res.status(400).json({ error: 'Invalid service' });
  }

  const pathStr = Array.isArray(path) ? path.join('/') : path || '';
  const url = `${target}/${pathStr}`;

  try {
    const forwardHeaders = {};
    if (req.headers['content-type']) forwardHeaders['Content-Type'] = req.headers['content-type'];
    if (req.headers['authorization']) forwardHeaders['Authorization'] = req.headers['authorization'];
    if (req.headers['cookie']) forwardHeaders['Cookie'] = req.headers['cookie'];

    const fetchOptions = {
      method: req.method,
      headers: forwardHeaders,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(url, fetchOptions);
    const text = await response.text();

    // Forward response headers
    const ct = response.headers.get('content-type');
    if (ct) res.setHeader('Content-Type', ct);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie');

    return res.status(response.status).send(text);
  } catch (err) {
    return res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}
