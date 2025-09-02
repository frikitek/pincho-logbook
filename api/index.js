module.exports = (req, res) => {
  if (req.url === '/health') {
    return res.status(200).json({ status: 'OK', ts: new Date().toISOString() });
  }
  return res.status(200).json({ ok: true, name: 'Laureados API', ts: new Date().toISOString() });
};