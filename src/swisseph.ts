import * as swisseph from 'swisseph';
import * as path from 'path';

// Result for a single planet returned from Swiss Ephemeris
export interface PlanetResult {
  name: string;
  sign: string;
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
  { id: swisseph.SE_CHIRON, name: 'Chiron' }
];

// Names of the zodiac signs in order
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Convert an ecliptic longitude in degrees to a zodiac sign
function zodiacSign(longitude: number): string {
  return SIGNS[Math.floor(longitude / 30) % 12];
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
        // Calculate planet position
        const result = swisseph.swe_calc_ut(
          jd,
          p.id,
          swisseph.SEFLG_SPEED | swisseph.SEFLG_TOPOCTR
        );

        // Type guard to check if result has the expected properties
        if (result && typeof result === 'object' && 'longitude' in result) {
          const longitude = (result as any).longitude;
          const speed = (result as any).longitudeSpeed;

          results.push({
            name: p.name,
            sign: zodiacSign(longitude),
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
      const result = swisseph.swe_houses(jd, lat, lon, system);
      
      // Type guard to check if result has the expected properties
      if (result && typeof result === 'object' && 'house' in result) {
        const houseArray = (result as any).house;
        if (Array.isArray(houseArray) && houseArray.length > 0) {
          return {
            ascendant: (result as any).ascendant,
            mc: (result as any).mc,
            armc: (result as any).armc,
            vertex: (result as any).vertex,
            equatorialAscendant: (result as any).equatorialAscendant,
            houseCusps: houseArray.slice(1, 13) // Houses 1-12
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
      SE_TRUE_NODE: swisseph.SE_TRUE_NODE
    }
  };
}
