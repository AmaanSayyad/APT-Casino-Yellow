export default function handler(req, res) {
  res.status(410).json({ success: false, error: 'VRF batch generation endpoint disabled' });
}