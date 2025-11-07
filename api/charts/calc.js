const fs = require('fs');
const path = require('path');
const https = require('https');

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

async function calculateDestinyChart(birthISO) {
  const base = 'https://destiny-chart-api.vercel.app/data/rules';
  const housesRaw = await fetchJSON(`${base}/houses.json`);
  const planetsRaw = await fetchJSON(`${base}/planets.json`);

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
