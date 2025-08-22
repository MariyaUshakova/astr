import { PlanetResult } from './swisseph';

// Bodies we provide placeholder positions for when the WASM library fails
const NAMES = [
  'Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn',
  'Uranus','Neptune','Pluto','Mean Node','True Node','Chiron'
];

// Very rough placeholder computation used when Swiss Ephemeris is unavailable
export function calcFallback(date: Date, lon: number, lat: number): PlanetResult[] {
  // Placeholder approximation. Real implementation should use JPL/Standish data.
  return NAMES.map(name => ({
    name,
    sign: 'Aries',        // all planets at 0° Aries
    longitude: 0,
    retrograde: false
  }));
}
