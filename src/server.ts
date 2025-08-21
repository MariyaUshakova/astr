import express from 'express';
import path from 'path';
import swisseph from 'swisseph';
import cities from './cities';

interface PlanetResult {
  name: string;
  sign: string;
  longitude: number;
  retrograde: boolean;
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
// serve compiled client script
app.use(express.static(__dirname));

// ephemeris files should be placed in ../ephemeris
swisseph.swe_set_ephe_path(path.join(__dirname, '..', 'ephemeris'));

const PLANETS = [
  { id: swisseph.SE_SUN, name: 'Sun' },
  { id: swisseph.SE_MOON, name: 'Moon' },
  { id: swisseph.SE_MERCURY, name: 'Mercury' },
  { id: swisseph.SE_VENUS, name: 'Venus' },
  { id: swisseph.SE_MARS, name: 'Mars' },
  { id: swisseph.SE_JUPITER, name: 'Jupiter' },
  { id: swisseph.SE_SATURN, name: 'Saturn' },
  { id: swisseph.SE_URANUS, name: 'Uranus' },
  { id: swisseph.SE_NEPTUNE, name: 'Neptune' },
  { id: swisseph.SE_PLUTO, name: 'Pluto' },
  { id: swisseph.SE_MEAN_NODE, name: 'Mean Node' },
  { id: swisseph.SE_TRUE_NODE, name: 'True Node' },
  { id: swisseph.SE_CHIRON, name: 'Chiron' }
];

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function zodiacSign(longitude: number): string {
  return SIGNS[Math.floor(longitude / 30) % 12];
}

app.post('/api/chart', (req, res) => {
  const { date, time, city } = req.body as { date: string; time: string; city: string };
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const location = cities.find(c => c.name === city);
  if (!location) {
    return res.status(400).json({ error: 'Unknown city' });
  }
  const ut = hour + minute / 60;
  const jd = swisseph.swe_julday(year, month, day, ut, swisseph.SE_GREG_CAL);
  swisseph.swe_set_topo(location.lon, location.lat, 0);
  const results: PlanetResult[] = PLANETS.map(p => {
    const { longitude, speed } = swisseph.swe_calc_ut(jd, p.id, swisseph.SEFLG_SPEED) as any;
    return {
      name: p.name,
      sign: zodiacSign(longitude),
      longitude,
      retrograde: speed < 0
    };
  });
  res.json({ planets: results });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
