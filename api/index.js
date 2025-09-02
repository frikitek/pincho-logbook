export default function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  if (path === '/api/health' || path === '/health') {
    return res.status(200).json({ status: 'OK', ts: new Date().toISOString() });
  }

  return res.status(200).json({ ok: true, name: 'Laureados API', ts: new Date().toISOString() });
}