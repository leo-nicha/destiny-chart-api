import calculateDestinyChart from './chart/calc';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    const { birth, topic = "personality" } = req.query;

    if (!birth) {
      return res.status(400).json({ error: "Missing parameter: birth (e.g., 1994-03-15T14:45)" });
    }

    // คำนวณพื้นดวง
    const chart = calculateDestinyChart(birth);

    // โหลดไฟล์ interpretation ตาม topic
    const filePath = path.join(process.cwd(), 'data', 'interpretation', `${topic}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Interpretation file not found for topic: ${topic}` });
    }

    const interpretationData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // รวมผลลัพธ์การคำนวณกับคำทำนาย
    const result = {
      input: { birth, topic },
      chart,
      interpretation: interpretationData,
      generated_at: new Date().toISOString()
    };

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(result);

  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
