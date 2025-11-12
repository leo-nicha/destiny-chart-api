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

  // 🧭 ตรวจว่าปีเป็น พ.ศ. หรือไม่
  const birthDate = new Date(birthISO);
  let year = birthDate.getUTCFullYear();
  if (year > 2400) {
    // ถ้ามากกว่า 2400 ถือว่าเป็นปีพุทธศักราช
    year -= 543;
  }

  // 🧮 สร้าง Date ใหม่หลังแปลงเป็น ค.ศ.
  const correctedBirth = new Date(
    Date.UTC(year, birthDate.getUTCMonth(), birthDate.getUTCDate(), birthDate.getUTCHours(), birthDate.getUTCMinutes())
  );

  // 🔭 คำนวณลัคนา (Sidereal Lahiri simplified)
  const day = correctedBirth.getUTCDate();
  const month = correctedBirth.getUTCMonth() + 1;
  const hour = correctedBirth.getUTCHours() + correctedBirth.getUTCMinutes() / 60;

  const lahiriOffset = 23.85; // ค่าเฉลี่ย Ayanamsa
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
    birth_converted: correctedBirth.toISOString(),
    lagnamIndex,
    lagnamName: houses[lagnamIndex],
    planets_position,
  };
}

module.exports = { calculateDestinyChart };
