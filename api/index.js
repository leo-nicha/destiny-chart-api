const { calculateDestinyChart } = require('./charts/calc.js');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const { birth, topic = 'personality' } = req.query;
    if (!birth) return res.status(400).json({ error: 'Missing birth param' });

    const chart = calculateDestinyChart(birth);

    const interpPath = path.join(process.cwd(), 'public/data/interpretation', `${topic}.json`);
    if (!fs.existsSync(interpPath)) {
      return res.status(404).json({ error: `File not found: ${topic}.json` });
    }
    const interpretation = JSON.parse(fs.readFileSync(interpPath, 'utf8'));

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      input: { birth, topic },
      chart,
      interpretation,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};
