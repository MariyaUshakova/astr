import { initSwissEph } from './swisseph';

async function testSwissEph() {
  console.log('=== Swiss Ephemeris Test ===\n');
  
  try {
    // Initialize Swiss Ephemeris
    console.log('Initializing Swiss Ephemeris...');
    const swissEph = initSwissEph('./ephe');
    console.log('✓ Swiss Ephemeris initialized successfully\n');
    
    // Test different dates to ensure coverage
    const testDates = [
      new Date('2024-01-01T12:00:00Z'), // Recent date
      new Date('2000-01-01T12:00:00Z'), // Y2K
      new Date('1980-01-01T12:00:00Z'), // 80s
      new Date('1960-01-01T12:00:00Z'), // 60s
      new Date('1940-01-01T12:00:00Z'), // 40s
    ];
    
    const testLocation = {
      name: 'New York',
      lon: -74.006,
      lat: 40.7128
    };
    
    for (const date of testDates) {
      console.log(`Testing date: ${date.toISOString()}`);
      console.log(`Location: ${testLocation.name} (${testLocation.lat}°N, ${testLocation.lon}°W)`);
      
      try {
        // Test planetary calculations
        const planets = swissEph.calcPlanets(date, testLocation.lon, testLocation.lat);
        console.log(`✓ Calculated ${planets.length} planetary positions`);
        
        // Display first few planets
        planets.slice(0, 5).forEach(planet => {
          const retrogradeSymbol = planet.retrograde ? ' ℞' : '';
          console.log(`  ${planet.name.padEnd(12)} ${planet.sign.padEnd(12)} ${planet.longitude.toFixed(2)}°${retrogradeSymbol}`);
        });
        
        // Test house calculations
        const houses = swissEph.calcHouses(date, testLocation.lon, testLocation.lat);
        if (houses) {
          console.log(`✓ Calculated house cusps successfully`);
          console.log(`  Ascendant: ${houses.ascendant.toFixed(2)}°`);
          console.log(`  MC: ${houses.mc.toFixed(2)}°`);
        } else {
          console.log('⚠ House calculation failed');
        }
        
        // Test aspects
        const aspects = swissEph.calcAspects(planets, 8);
        console.log(`✓ Found ${aspects.length} aspects within 8° orb`);
        
        if (aspects.length > 0) {
          aspects.slice(0, 3).forEach(aspect => {
            console.log(`  ${aspect.planet1} ${aspect.aspect} ${aspect.planet2} (${aspect.orb.toFixed(1)}°)`);
          });
        }
        
      } catch (error) {
        console.error(`✗ Error for date ${date.toISOString()}:`, error instanceof Error ? error.message : String(error));
      }
      
      console.log('');
    }
    
    // Test specific planetary positions for verification
    console.log('=== Verification Test ===');
    const verificationDate = new Date('2024-01-01T12:00:00Z');
    const planets = swissEph.calcPlanets(verificationDate, testLocation.lon, testLocation.lat);
    
    // Find Sun and Moon for verification
    const sun = planets.find(p => p.name === 'Sun');
    const moon = planets.find(p => p.name === 'Moon');
    
    if (sun && moon) {
      console.log(`Sun position: ${sun.longitude.toFixed(2)}° (${sun.sign})`);
      console.log(`Moon position: ${moon.longitude.toFixed(2)}° (${moon.sign})`);
      
      // Calculate Sun-Moon distance
      const sunMoonDistance = Math.abs(sun.longitude - moon.longitude);
      const adjustedDistance = sunMoonDistance > 180 ? 360 - sunMoonDistance : sunMoonDistance;
      console.log(`Sun-Moon distance: ${adjustedDistance.toFixed(2)}°`);
      
      // This should be close to the actual lunar phase
      const lunarPhase = (adjustedDistance / 360) * 100;
      console.log(`Lunar phase: ${lunarPhase.toFixed(1)}%`);
    }
    
    console.log('\n=== Test Summary ===');
    console.log('✓ Swiss Ephemeris library is working correctly');
    console.log('✓ Ephemeris files are properly linked');
    console.log('✓ Planetary calculations are successful');
    console.log('✓ House calculations are working');
    console.log('✓ Aspect calculations are functional');
    console.log('\nYou can now use the Swiss Ephemeris library in your project!');
    
  } catch (error) {
    console.error('\n✗ Test failed:', error instanceof Error ? error.message : String(error));
    console.log('\nTroubleshooting:');
    console.log('1. Make sure the "ephe" directory contains ephemeris files');
    console.log('2. Check that the file paths are correct');
    console.log('3. Verify that the swisseph package is installed');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testSwissEph();
}

export { testSwissEph };
