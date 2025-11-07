const { calculateDestinyChart } = require('./charts/calc.js');

module.exports = async (req, res) => {
  try {
    const { birth, topic = 'personality' } = req.query;
    if (!birth) return res.status(400).json({ error: 'Missing birth param' });

    const chart = await calculateDestinyChart(birth);
    const interpUrl = `https://destiny-chart-api.vercel.app/data/interpretation/${topic}.json`;

    const resp = await fetch(interpUrl);
    const interpretation = await resp.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({
      input: { birth, topic },
      chart,
      interpretation,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};
