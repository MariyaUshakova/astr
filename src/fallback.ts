import { PlanetResult } from './swisseph';

const NAMES = [
  'Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn',
  'Uranus','Neptune','Pluto','Mean Node','True Node','Chiron'
];

export function calcFallback(date: Date, lon: number, lat: number): PlanetResult[] {
  // Placeholder approximation. Real implementation should use JPL/Standish data.
  return NAMES.map(name => ({
    name,
    sign: 'Aries',
    longitude: 0,
    retrograde: false
  }));
}
