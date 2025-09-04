export default function handler(_req, res) {
  res.status(200).json({ ok: true, name: 'Laureados API', ts: new Date().toISOString() });
}


