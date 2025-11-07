const fs = require('fs');
const path = require('path');

function calculateDestinyChart(birthISO) {
  const housesPath = path.join(__dirname, '../data/rules/houses.json');
  const planetsPath = path.join(__dirname, '../data/rules/planets.json');

  const housesRaw = JSON.parse(fs.readFileSync(housesPath, 'utf8'));
  const planetsRaw = JSON.parse(fs.readFileSync(planetsPath, 'utf8'));

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
