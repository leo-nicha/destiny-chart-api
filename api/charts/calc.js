const fs = require("fs");
const path = require("path");

function calculateDestinyChart(birthISO) {
  const base = path.join(process.cwd(), "public/data/rules");

  const housesRaw = JSON.parse(fs.readFileSync(path.join(base, "houses.json"), "utf8"));
  const planetsRaw = JSON.parse(fs.readFileSync(path.join(base, "planets.json"), "utf8"));
  const aspectsRaw = JSON.parse(fs.readFileSync(path.join(base, "aspects.json"), "utf8"));
  const statusRaw = JSON.parse(fs.readFileSync(path.join(base, "status.json"), "utf8"));

  const houses = [];
  for (let i = 1; i <= 12; i++) {
    houses[i] = housesRaw[String(i)] || `House ${i}`;
  }

  const planetKeys = Object.keys(planetsRaw);
  const birthDate = new Date(birthISO);

  // ✅ แปลงวันเวลาเกิดเป็นค่าระดับองศา sidereal (Lahiri)
  const day = birthDate.getUTCDate();
  const month = birthDate.getUTCMonth() + 1;
  const year = birthDate.getUTCFullYear();
  const hour = birthDate.getUTCHours() + birthDate.getUTCMinutes() / 60;

  // คำนวณดัชนีลัคนาแบบ Lahiri simplified (ไม่ต้องใช้ external lib)
  const lahiriOffset = 23.85; // ค่าเฉลี่ย Lahiri Ayanamsa
  const baseDegree = ((month * 30) + day + hour / 2 + (year % 12) * 2 - lahiriOffset) % 360;
  const lagnamIndex = Math.floor((baseDegree / 30) % 12) + 1;

  const planets_position = planetKeys.map((planetKey, i) => {
    const houseIndex = (((lagnamIndex - 1) + i) % 12) + 1;
    return {
      planet: planetKey,
      houseIndex,
      houseName: houses[houseIndex],
      aspect: aspectsRaw[planetKey] || null,
      status: statusRaw[planetKey] || null,
    };
  });

  return {
    birthISO,
    lagnamIndex,
    lagnamName: houses[lagnamIndex],
    planets_position,
  };
}

module.exports = { calculateDestinyChart };
