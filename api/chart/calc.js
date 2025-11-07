import fs from 'fs';
import path from 'path';

const calculateDestinyChart = (birthISO, opts = {}) => {
  const lat = typeof opts.lat === 'number' ? opts.lat : 13.7563; // default Bangkok
  const lon = typeof opts.lon === 'number' ? opts.lon : 100.5018;

  const rulesPath = path.join(process.cwd(), 'data', 'rules'); // if you have rules
  const housesFile = path.join(process.cwd(), 'data', 'rules', 'houses.json');
  const planetsFile = path.join(process.cwd(), 'data', 'rules', 'planets.json');

  // fallback: if rules not exist in rules/, try project root data/ (we've loaded planets.json/houses.json earlier)
  const housesDataPath = fs.existsSync(housesFile)
    ? housesFile
    : path.join(process.cwd(), 'data', 'houses.json');
  const planetsDataPath = fs.existsSync(planetsFile)
    ? planetsFile
    : path.join(process.cwd(), 'data', 'planets.json');

  const housesRaw = JSON.parse(fs.readFileSync(housesDataPath, 'utf-8'));
  const planetsRaw = JSON.parse(fs.readFileSync(planetsDataPath, 'utf-8'));

  // Convert housesRaw (which may have string keys "1".."12") => array 1..12
  const houses = [];
  for (let i = 1; i <= 12; i++) {
    houses[i] = housesRaw[String(i)] || housesRaw[i] || `House ${i}`;
  }

  // planets keys as string array in a stable order
  const planetKeys = Object.keys(planetsRaw);

  // === seed from birth time + lat/lon ===
  const birthDate = new Date(birthISO);
  if (isNaN(birthDate.getTime())) {
    throw new Error('Invalid birth ISO date');
  }

  // deterministic seed: use dayMillis + hour + lat/lon rounding => predictable per input
  const dayMillis = Math.floor(birthDate.getTime() / (1000 * 60 * 60 * 24));
  const hour = birthDate.getUTCHours() + birthDate.getUTCMinutes() / 60;
  // mix lat/lon into seed to vary for location
  const latFactor = Math.round((lat + 90) * 100); // 0..18000
  const lonFactor = Math.round((lon + 180) * 100); // 0..36000

  const seed = (Math.abs(dayMillis) + Math.round(hour * 100) + latFactor + lonFactor) % 12;

  // Ascendant (lagnam) index -- 1..12
  const lagnamIndex = ((seed % 12) + 1); // 1..12

  // Place planets into houses by rotating planet list starting at lagnamIndex
  // This is a deterministic mapping: planet at index 0 -> house lagnamIndex, next -> lagnamIndex+1, ...
  const planets_position = planetKeys.map((planetKey, i) => {
    const houseIndex = (((lagnamIndex - 1) + i) % 12) + 1; // 1..12
    const houseName = houses[houseIndex] || `House ${houseIndex}`;
    const planetInfo = planetsRaw[planetKey] || {};
    return {
      planet: planetKey,            // e.g. "sun"
      planet_name_th: planetInfo.name_th || null,
      houseIndex,
      houseName,
      note: `Mapped deterministically by seed. seed=${seed}`,
    };
  });

  // Build chart
  const chart = {
    birthISO: birthDate.toISOString(),
    location: { lat, lon },
    lagnamIndex,
    lagnamName: houses[lagnamIndex],
    planets_position,
    metadata: {
      method: 'approx-deterministic-mapping-v1',
      seed,
      warning: 'This is an approximate/deterministic house mapping. For precise planetary longitudes use an ephemeris.',
    },
  };

  return chart;
}

export default calculateDestinyChart;