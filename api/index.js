const { calculateDestinyChart } = require('./charts/calc.js');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const q = req.method === 'POST' ? req.body : req.query;
    const { birth, topic = 'personality' } = q || {};

    if (!birth) {
      return res.status(400).json({ error: 'Missing birth param' });
    }

    const chart = calculateDestinyChart(birth);

    // ใช้ __dirname เพื่อให้ path ถูกแม้ตอน deploy
    const interpPath = path.join(__dirname, 'data', 'interpretation', `${topic}.json`);
    if (!fs.existsSync(interpPath)) {
      return res.status(404).json({ error: `File not found: ${topic}` });
    }

    const interpretationData = JSON.parse(fs.readFileSync(interpPath, 'utf8'));
    const result = buildInterpretation(chart, interpretationData);

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      input: { birth, topic },
      chart,
      interpretation: result,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Serverless error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};

function buildInterpretation(chart, data) {
  const out = {};
  for (const p of chart.planets_position) {
    const key = `${p.planet}_in_${p.houseIndex}`;
    out[key] = data[key] || null;
  }
  return out;
}
