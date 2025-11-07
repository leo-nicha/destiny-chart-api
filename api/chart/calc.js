import fs from 'fs';
import path from 'path';

const calculateDestinyChart = (birthISO) => {
  // โหลด rule data
  const rulesPath = path.join(process.cwd(), 'data', 'rules');
  const planets = JSON.parse(fs.readFileSync(`${rulesPath}/planets.json`, 'utf-8'));
  const houses = JSON.parse(fs.readFileSync(`${rulesPath}/houses.json`, 'utf-8'));
  const status = JSON.parse(fs.readFileSync(`${rulesPath}/status.json`, 'utf-8'));
  const aspects = JSON.parse(fs.readFileSync(`${rulesPath}/aspects.json`, 'utf-8'));
  const settings = JSON.parse(fs.readFileSync(`${rulesPath}/settings.json`, 'utf-8'));

  // === ตัวอย่างการคำนวณเบื้องต้น ===
  // (ในอนาคตสามารถปรับให้คำนวณจริงจากเวลาเกิดได้)
  const birthDate = new Date(birthISO);
  const seed = birthDate.getTime() % 12; // mock ลัคนาแบบง่าย ๆ

  // ตัวอย่างผลลัพธ์เบื้องต้น
  const chart = {
    lagnam: houses[seed % 12]?.name || "เมษ",
    planets_position: planets.map((p, i) => ({
      name: p.name,
      house: houses[(seed + i) % 12]?.name,
      status: status[i % status.length]?.type || "ปกติ",
    })),
    aspects_used: aspects.length,
    settings: settings,
  };

  return chart;
}

export default calculateDestinyChart;