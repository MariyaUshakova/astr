import * as swisseph from 'swisseph';
import * as path from 'path';

// Result for a single planet returned from Swiss Ephemeris
export interface PlanetResult {
  name: string;
  sign: string;
  element: string;
  longitude: number;
  retrograde: boolean;
}

// IDs understood by the Swiss Ephemeris library for each planet
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
  { id: swisseph.SE_CHIRON, name: 'Chiron' },
  { id: swisseph.SE_MEAN_APOG, name: 'Lilith' }
];

// Names of the zodiac signs in order
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Element associations for each sign
const SIGN_ELEMENTS = {
  'Aries': 'Fire',
  'Taurus': 'Earth',
  'Gemini': 'Air',
  'Cancer': 'Water',
  'Leo': 'Fire',
  'Virgo': 'Earth',
  'Libra': 'Air',
  'Scorpio': 'Water',
  'Sagittarius': 'Fire',
  'Capricorn': 'Earth',
  'Aquarius': 'Air',
  'Pisces': 'Water'
};

// Element interface
export interface ElementCount {
  Fire: number;
  Earth: number;
  Air: number;
  Water: number;
}

// Normalize a degree value to the range 0 <= deg < 360
function normalizeDegrees(deg: number): number {
  return (deg % 360 + 360) % 360;
}

// Convert an ecliptic longitude in degrees to a zodiac sign
function zodiacSign(longitude: number): string {
  const normalized = normalizeDegrees(longitude);
  return SIGNS[Math.floor(normalized / 30) % 12];
}

// Get element for a zodiac sign
function getElement(sign: string): string {
  return SIGN_ELEMENTS[sign as keyof typeof SIGN_ELEMENTS] || 'Unknown';
}

// Count elements from planetary positions
function countElements(planets: PlanetResult[]): ElementCount {
  const counts: ElementCount = {
    Fire: 0,
    Earth: 0,
    Air: 0,
    Water: 0
  };

  planets.forEach(planet => {
    const element = getElement(planet.sign);
    if (element in counts) {
      counts[element as keyof ElementCount]++;
    }
  });

  return counts;
}

// Initialize Swiss Ephemeris with ephemeris data path
export function initSwissEph(ephePath = './ephe') {
  // Set the main ephemeris path
  swisseph.swe_set_ephe_path(ephePath);
  
  // Compute planetary positions for a given date/location
  function calcPlanets(date: Date, lon: number, lat: number): PlanetResult[] {
    // Convert JS Date to Julian Day
    const jd = swisseph.swe_julday(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600,
      swisseph.SE_GREG_CAL
    );

    // Set observer location (topocentric)
    swisseph.swe_set_topo(lon, lat, 0);

    const results: PlanetResult[] = [];
    
    PLANETS.forEach(p => {
      try {
        // Calculate planet position using Swiss ephemeris files
        const flags =
          swisseph.SEFLG_SWIEPH | swisseph.SEFLG_SPEED | swisseph.SEFLG_TOPOCTR;
        const result = swisseph.swe_calc_ut(jd, p.id, flags);

        // Type guard to check if result has the expected properties
        if (result && typeof result === 'object' && 'longitude' in result) {
          const longitude = normalizeDegrees((result as any).longitude);
          const speed = (result as any).longitudeSpeed;

          const sign = zodiacSign(longitude);
          results.push({
            name: p.name,
            sign: sign,
            element: getElement(sign),
            longitude: longitude,
            retrograde: speed < 0
          });
        } else {
          console.warn(`Error calculating ${p.name}: invalid result`);
        }
      } catch (error) {
        console.error(`Error calculating ${p.name}:`, error);
      }
    });

    return results;
  }

  // Calculate house cusps
  function calcHouses(date: Date, lon: number, lat: number, system = 'P') {
    const jd = swisseph.swe_julday(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600,
      swisseph.SE_GREG_CAL
    );

    try {
      const flags = swisseph.SEFLG_SWIEPH;
      // Set observer location for consistency
      swisseph.swe_set_topo(lon, lat, 0);
      const result = swisseph.swe_houses_ex(jd, flags, lat, lon, system);

      // Type guard to check if result has the expected properties
      if (result && typeof result === 'object' && 'house' in result) {
        const houseArray = (result as any).house;
        if (Array.isArray(houseArray) && houseArray.length > 0) {
          const ascendant = normalizeDegrees((result as any).ascendant);
          const mc = normalizeDegrees((result as any).mc);
          const houseCusps = houseArray
            .slice(1, 13)
            .map((deg: number) => normalizeDegrees(deg)); // Houses 1-12
          const ic = houseCusps[3];
          const desc = houseCusps[6];

          const HOUSE_NAMES = [
            'Asc',
            'II',
            'III',
            'IC',
            'V',
            'VI',
            'Desc',
            'VIII',
            'IX',
            'MC',
            'XI',
            'XII',
          ];
          const houses = HOUSE_NAMES.map((name, i) => ({
            name,
            longitude: houseCusps[i],
            sign: zodiacSign(houseCusps[i]),
          }));

          return {
            ascendant,
            mc,
            ic,
            desc,
            armc: (result as any).armc,
            vertex: (result as any).vertex,
            equatorialAscendant: (result as any).equatorialAscendant,
            houseCusps,
            houses,
          };
        }
      }
      
      console.warn('Error calculating houses: invalid result');
      return null;
    } catch (error) {
      console.error('Error calculating houses:', error);
      return null;
    }
  }

  // Calculate aspects between planets
  function calcAspects(planets: PlanetResult[], orb = 8) {
    const aspects: Array<{
      planet1: string;
      planet2: string;
      aspect: string;
      orb: number;
      exact: number;
    }> = [];

    const aspectTypes = [
      { name: 'Conjunction', angle: 0, orb: orb },
      { name: 'Opposition', angle: 180, orb: orb },
      { name: 'Trine', angle: 120, orb: orb },
      { name: 'Square', angle: 90, orb: orb },
      { name: 'Sextile', angle: 60, orb: orb }
    ];

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const p1 = planets[i];
        const p2 = planets[j];
        const diff = Math.abs(p1.longitude - p2.longitude);
        const distance = diff > 180 ? 360 - diff : diff;

        aspectTypes.forEach(aspect => {
          const orbDiff = Math.abs(distance - aspect.angle);
          if (orbDiff <= aspect.orb) {
            aspects.push({
              planet1: p1.name,
              planet2: p2.name,
              aspect: aspect.name,
              orb: orbDiff,
              exact: aspect.angle
            });
          }
        });
      }
    }

    return aspects.sort((a, b) => a.orb - b.orb);
  }

  return { 
    calcPlanets, 
    calcHouses, 
    calcAspects,
    countElements,
    // Expose some useful constants
    constants: {
      SE_SUN: swisseph.SE_SUN,
      SE_MOON: swisseph.SE_MOON,
      SE_MERCURY: swisseph.SE_MERCURY,
      SE_VENUS: swisseph.SE_VENUS,
      SE_MARS: swisseph.SE_MARS,
      SE_JUPITER: swisseph.SE_JUPITER,
      SE_SATURN: swisseph.SE_SATURN,
      SE_URANUS: swisseph.SE_URANUS,
      SE_NEPTUNE: swisseph.SE_NEPTUNE,
      SE_PLUTO: swisseph.SE_PLUTO,
      SE_CHIRON: swisseph.SE_CHIRON,
      SE_MEAN_NODE: swisseph.SE_MEAN_NODE,
      SE_TRUE_NODE: swisseph.SE_TRUE_NODE,
      SE_MEAN_APOG: swisseph.SE_MEAN_APOG
    }
  };
}
