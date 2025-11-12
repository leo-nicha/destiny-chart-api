const { calculateDestinyChart } = require("./charts/calc.js");
const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  // ✅ ตั้งค่า CORS (ให้ frontend เรียกได้จากทุก origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ handle OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    // ✅ รับค่าจาก query
    const { birth, topic = "personality" } = req.query;

    if (!birth) {
      return res.status(400).json({ error: "Missing birth param" });
    }

    // ✅ คำนวณพื้นดวง
    const chart = calculateDestinyChart(birth);

    // ✅ โหลดไฟล์ interpretation
    const interpBase = path.join(process.cwd(), "public/data/interpretation");

    // ✅ รองรับ topic=all
    const topics =
      topic === "all"
        ? ["personality", "career", "love", "finance"]
        : [topic];

    const interpretation = {};

    // ✅ ผูกคำทำนายกับตำแหน่งดาว
    for (const t of topics) {
      const filePath = path.join(interpBase, `${t}.json`);
      if (fs.existsSync(filePath)) {
        const dataset = JSON.parse(fs.readFileSync(filePath, "utf8"));

        interpretation[t] = chart.planets_position.reduce((acc, p) => {
          const possibleKeys = [
            `${p.planet}_in_${p.houseName?.toLowerCase()}`,
            `${p.planet}_in_${p.houseIndex}`,
            p.planet
          ];

          acc[p.planet] =
            possibleKeys.map(k => dataset[k]).find(v => v !== undefined) ||
            "ยังไม่มีคำทำนายสำหรับตำแหน่งนี้";
          return acc;
        }, {});
      } else {
        interpretation[t] = { error: `File not found: ${t}.json` };
      }
    }

    // ✅ ส่งผลลัพธ์กลับ
    res.status(200).json({
      input: { birth, topic },
      chart,
      interpretation,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("API error:", err);
    res
      .status(500)
      .json({ error: "Internal Server Error", details: err.message });
  }
};
