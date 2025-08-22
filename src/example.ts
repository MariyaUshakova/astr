import { initSwissEph } from './swisseph';

// Example usage of Swiss Ephemeris
async function example() {
  try {
    // Initialize Swiss Ephemeris
    // Note: You'll need to download ephemeris data files and place them in an 'ephe' directory
    const swissEph = initSwissEph('./ephe');
    
    // Example: Calculate planetary positions for current time in New York
    const now = new Date();
    const newYorkLon = -74.006; // Longitude
    const newYorkLat = 40.7128; // Latitude
    
    console.log('=== Planetary Positions ===');
    console.log(`Date: ${now.toISOString()}`);
    console.log(`Location: New York (${newYorkLat}°N, ${newYorkLon}°W)`);
    console.log('');
    
    const planets = swissEph.calcPlanets(now, newYorkLon, newYorkLat);
    
    planets.forEach(planet => {
      const retrogradeSymbol = planet.retrograde ? ' ℞' : '';
      console.log(`${planet.name.padEnd(12)} ${planet.sign.padEnd(12)} ${planet.longitude.toFixed(2)}°${retrogradeSymbol}`);
    });
    
    console.log('');
    console.log('=== House Cusps ===');
    const houses = swissEph.calcHouses(now, newYorkLon, newYorkLat);
    
    if (houses) {
      console.log(`Ascendant: ${houses.ascendant.toFixed(2)}°`);
      console.log(`MC: ${houses.mc.toFixed(2)}°`);
      console.log('');
      console.log('House Cusps:');
      houses.houseCusps.forEach((cusp, index) => {
        console.log(`House ${index + 1}: ${cusp.toFixed(2)}°`);
      });
    }
    
    console.log('');
    console.log('=== Major Aspects ===');
    const aspects = swissEph.calcAspects(planets, 8); // 8° orb
    
    aspects.forEach(aspect => {
      console.log(`${aspect.planet1.padEnd(12)} ${aspect.aspect.padEnd(12)} ${aspect.planet2.padEnd(12)} ${aspect.orb.toFixed(1)}°`);
    });
    
  } catch (error) {
    console.error('Error:', error);
    console.log('');
    console.log('Note: To use this example, you need to:');
    console.log('1. Download Swiss Ephemeris data files from: https://www.astro.com/ftp/swisseph/ephe/');
    console.log('2. Create an "ephe" directory in your project root');
    console.log('3. Place the ephemeris files (*.se1, *.se1m, etc.) in the ephe directory');
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  example();
}

export { example };
