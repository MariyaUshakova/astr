export interface PlanetResult {
  name: string;
  sign: string;
  longitude: number;
  retrograde: boolean;
}

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

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function zodiacSign(longitude: number): string {
  return SIGNS[Math.floor(longitude / 30) % 12];
}

let modulePromise: Promise<any> | null = null;

export async function initSwissEph(ephePath = '.') {
  if (!modulePromise) {
    modulePromise = (window as any).createSwissEphModule({
      locateFile: (file: string) => file
    });
  }
  const Module = await modulePromise;
  Module.ccall('swe_set_ephe_path', null, ['string'], [ephePath]);

  const swe_julday = Module.cwrap('swe_julday', 'number', ['number','number','number','number','number']);
  const swe_calc_ut = Module.cwrap('swe_calc_ut', 'number', ['number','number','number','number','number']);
  const swe_set_topo = Module.cwrap('swe_set_topo', null, ['number','number','number']);

  function calcPlanets(date: Date, lon: number, lat: number): PlanetResult[] {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    const ut = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
    const jd = swe_julday(year, month, day, ut, 1);
    swe_set_topo(lon, lat, 0);
    const SEFLG_SPEED = 256;
    const results: PlanetResult[] = [];
    const xxPtr = Module._malloc(6 * 8);
    const serrPtr = Module._malloc(256);
    PLANETS.forEach(p => {
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
    Module._free(xxPtr);
    Module._free(serrPtr);
    return results;
  }

  return { calcPlanets };
}
