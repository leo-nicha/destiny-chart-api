export default async function handler(req, res) {
  try {
    // รองรับ GET / POST
    const q = req.method === 'POST' ? req.body : req.query;

    const { birth, topic = 'personality', lat, lon } = q || {};

    if (!birth) {
      return res.status(400).json({ error: 'Missing parameter: birth (ISO 8601, e.g. 1994-03-15T14:45)' });
    }

    // คำนวณ chart (รับ birth ISO และ optional lat/lon)
    const chart = calculateDestinyChart(birth, {
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
    });

    // โหลด interpretation file (จาก data/interpretation/<topic>.json)
    const interpPath = path.join(process.cwd(), 'data', 'interpretation', `${topic}.json`);
    if (!fs.existsSync(interpPath)) {
      return res.status(404).json({ error: `Interpretation file not found for topic: ${topic}` });
    }
    const interpretationData = JSON.parse(fs.readFileSync(interpPath, 'utf-8'));

    // รวมผลลัพธ์: ตอบกลับ chart และ interpretation ที่เกี่ยวข้อง
    const result = {
      input: { birth, topic, lat: lat || 'default', lon: lon || 'default' },
      chart,
      // ตัวอย่าง: map คำอธิบาย personality โดยตำแหน่งดาวในเรือน
      interpretation: buildInterpretationForTopic(chart, interpretationData),
      generated_at: new Date().toISOString(),
    };

    // CORS (อนุญาตทุกโดเมน) — ปรับก่อน deploy ถ้าต้องการจำกัด
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    return res.status(200).json(result);
  } catch (err) {
    console.error('destiny-chart-api error', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}

/**
 * ฟังก์ชันช่วย: เอา chart + interpretation file มาจับคู่ให้เป็นผลลัพธ์
 * - interpretationData คือ object เช่น personality.json (key เป็น "{planet}_in_{houseIndex}")
 */
function buildInterpretationForTopic(chart, interpretationData) {
  const out = {
    summary: [],
    by_planet: {},
  };

  // for each planet in chart.planets_position
  for (const p of chart.planets_position) {
    // p.houseIndex คือเลขเรือน 1..12 (ตามโค้ด calc.js ผลลัพธ์)
    const key = `${p.planet}_in_${p.houseIndex}`; // เช่น "sun_in_1"
    const text = interpretationData[key] || null;
    out.by_planet[p.planet] = {
      planet_name: p.planet,
      houseIndex: p.houseIndex,
      houseName: p.houseName,
      generated_note: p.note || null,
      interpretation: text,
    };
    if (text) out.summary.push({ planet: p.planet, house: p.houseIndex, text });
  }

  return out;
}