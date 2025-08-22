// Result for a single planet returned from Swiss Ephemeris
export interface PlanetResult {
  name: string;
  sign: string;
  longitude: number;
  retrograde: boolean;
}

// IDs understood by the Swiss Ephemeris library for each planet
const PLANETS = [
  { id: 0, name: 'Sun' },
  { id: 1, name: 'Moon' },
  { id: 2, name: 'Mercury' },
  { id: 3, name: 'Venus' },
  { id: 4, name: 'Mars' },
  { id: 5, name: 'Jupiter' },
  { id: 6, name: 'Saturn' },
  { id: 7, name: 'Uranus' },
  { id: 8, name: 'Neptune' },
  { id: 9, name: 'Pluto' },
  { id: 10, name: 'Mean Node' },
  { id: 11, name: 'True Node' },
  { id: 15, name: 'Chiron' }
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

// Cache the WASM module so it is only initialised once
let modulePromise: Promise<any> | null = null;

// Load the Swiss Ephemeris WASM module and expose a calculation helper
export async function initSwissEph(ephePath = '.') {
  // Initialise the module on first use
  if (!modulePromise) {
    modulePromise = (window as any).createSwissEphModule({
      // wasm files are served from the same directory
      locateFile: (file: string) => file
    });
  }
  const Module = await modulePromise;
  // Point the library to the ephemeris data
  Module.ccall('swe_set_ephe_path', null, ['string'], [ephePath]);

  // Bind required C functions
  const swe_julday = Module.cwrap('swe_julday', 'number', ['number','number','number','number','number']);
  const swe_calc_ut = Module.cwrap('swe_calc_ut', 'number', ['number','number','number','number','number']);
  const swe_set_topo = Module.cwrap('swe_set_topo', null, ['number','number','number']);

  // Compute planetary positions for a given date/location
  function calcPlanets(date: Date, lon: number, lat: number): PlanetResult[] {
    // Convert JS Date to Julian Day
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const ut = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const jd = swe_julday(year, month, day, ut, 1);
    // Set observer location
    swe_set_topo(lon, lat, 0);
    const SEFLG_SPEED = 256;
    const results: PlanetResult[] = [];
    // Allocate buffers for the C library
    const xxPtr = Module._malloc(6 * 8);
    const serrPtr = Module._malloc(256);
    PLANETS.forEach(p => {
      // Perform calculation for the planet
      Module.ccall('swe_calc_ut', 'number',
        ['number','number','number','number','number'],
        [jd, p.id, SEFLG_SPEED, xxPtr, serrPtr]
      );
      const xx = new Float64Array(Module.HEAPF64.buffer, xxPtr, 6);
      const lonVal = xx[0];
      const speed = xx[3];
      results.push({
        name: p.name,
        sign: zodiacSign(lonVal),
        longitude: lonVal,
        retrograde: speed < 0
      });
    });
    // Free allocated memory
    Module._free(xxPtr);
    Module._free(serrPtr);
    return results;
  }

  return { calcPlanets };
}
