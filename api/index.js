const { calculateDestinyChart } = require('./charts/calc.js');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const q = req.method === 'POST' ? req.body : req.query;
    const { birth, topic = 'personality', lat, lon } = q || {};

    if (!birth) {
      return res.status(400).json({ error: 'Missing parameter: birth (ISO 8601, e.g. 1994-03-15T14:45)' });
    }

    // คำนวณดวงพื้น
    const chart = calculateDestinyChart(birth, {
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    });

    // โหลด interpretation
    const interpPath = path.join(process.cwd(), 'data', 'interpretation', `${topic}.json`);
    if (!fs.existsSync(interpPath)) {
      return res.status(404).json({ error: `Interpretation file not found for topic: ${topic}` });
    }

    const interpretationData = JSON.parse(fs.readFileSync(interpPath, 'utf-8'));
    const interpretation = buildInterpretation(chart, interpretationData);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      input: { birth, topic, lat, lon },
      chart,
      interpretation,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};

function buildInterpretation(chart, interpretationData) {
  const result = {};
  for (const p of chart.planets_position) {
    const key = `${p.planet}_in_${p.houseIndex}`;
    result[key] = interpretationData[key] || null;
  }
  return result;
}
