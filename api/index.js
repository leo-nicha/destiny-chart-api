const { calculateDestinyChart } = require('./charts/calc.js');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const { birth, topic = 'personality' } = req.query;
    if (!birth) return res.status(400).json({ error: 'Missing birth param' });

    const chart = calculateDestinyChart(birth);

    const interpBase = path.join(process.cwd(), 'public/data/interpretation');

    // ✅ รองรับ topic=all
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
        interpretation[t] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
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
