const { calculateDestinyChart } = require('./charts/calc.js');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { birth, topic = 'personality' } = req.query;
    if (!birth) return res.status(400).json({ error: 'Missing birth param' });

    const chart = calculateDestinyChart(birth);

    const interpBase = path.join(process.cwd(), 'public/data/interpretation');

    let topics = [];
    if (topic === 'all') {
      topics = ['personality', 'career', 'love', 'finance'];
    } else {
      topics = [topic];
    }

    const interpretation = {};

for (const t of topics) {
  const filePath = path.join(interpBase, `${t}.json`);
  if (fs.existsSync(filePath)) {
    const dataset = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    interpretation[t] = chart.planets_position.reduce((acc, p) => {
      const key = `${p.planet}_in_${p.houseIndex}`;
      acc[p.planet] = dataset[key] || null;
      return acc;
    }, {});
  } else {
    interpretation[t] = { error: `File not found: ${t}.json` };
  }
}

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
