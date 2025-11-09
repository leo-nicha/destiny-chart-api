const fs = require('fs');
const path = require('path');

function calculateDestinyChart(birthISO) {
  const base = path.join(process.cwd(), 'public/data/rules');

  const housesRaw = JSON.parse(fs.readFileSync(path.join(base, 'houses.json'), 'utf8'));
  const planetsRaw = JSON.parse(fs.readFileSync(path.join(base, 'planets.json'), 'utf8'));
  const aspectsRaw = JSON.parse(fs.readFileSync(path.join(base, 'aspects.json'), 'utf8'));
  const statusRaw = JSON.parse(fs.readFileSync(path.join(base, 'status.json'), 'utf8'));

  const houses = [];
  for (let i = 1; i <= 12; i++) {
    houses[i] = housesRaw[String(i)] || `House ${i}`;
  }

  const planetKeys = Object.keys(planetsRaw);
  const birthDate = new Date(birthISO);
  const seed = Math.floor(birthDate.getTime() / (1000 * 60 * 60)) % 12;
  const lagnamIndex = ((seed % 12) + 1);

  const planets_position = planetKeys.map((planetKey, i) => {
    const houseIndex = (((lagnamIndex - 1) + i) % 12) + 1;
    return {
      planet: planetKey,
      houseIndex,
      houseName: houses[houseIndex],
      aspect: aspectsRaw[planetKey] || null,
      status: statusRaw[planetKey] || null
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
