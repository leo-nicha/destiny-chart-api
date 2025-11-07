const fs = require('fs');
const path = require('path');

function calculateDestinyChart(birthISO, opts = {}) {
  const lat = opts.lat || 13.7563;
  const lon = opts.lon || 100.5018;

  const housesPath = path.join(process.cwd(), 'data', 'rules', 'houses.json');
  const planetsPath = path.join(process.cwd(), 'data', 'rules', 'planets.json');

  const housesRaw = JSON.parse(fs.readFileSync(housesPath, 'utf-8'));
  const planetsRaw = JSON.parse(fs.readFileSync(planetsPath, 'utf-8'));

  const houses = [];
  for (let i = 1; i <= 12; i++) {
    houses[i] = housesRaw[String(i)] || `House ${i}`;
  }

  const planetKeys = Object.keys(planetsRaw);
  const birthDate = new Date(birthISO);
  const daySeed = Math.floor(birthDate.getTime() / (1000 * 60 * 60 * 24));
  const hour = birthDate.getUTCHours() + birthDate.getUTCMinutes() / 60;
  const seed = (daySeed + Math.round(hour * 100) + lat + lon) % 12;
  const lagnamIndex = ((seed % 12) + 1);

  const planets_position = planetKeys.map((planetKey, i) => {
    const houseIndex = (((lagnamIndex - 1) + i) % 12) + 1;
    return {
      planet: planetKey,
      houseIndex,
      houseName: houses[houseIndex],
    };
  });

  return {
    birthISO,
    location: { lat, lon },
    lagnamIndex,
    lagnamName: houses[lagnamIndex],
    planets_position,
  };
}

module.exports = { calculateDestinyChart };