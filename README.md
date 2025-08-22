# Astrological Project

This project includes the Swiss Ephemeris library for high-precision astrological calculations.

## Features

- **Swiss Ephemeris Integration**: High-precision planetary position calculations
- **Planetary Positions**: Calculate positions for all major planets, Sun, Moon, and asteroids
- **House Calculations**: Support for various house systems (Placidus, Koch, etc.)
- **Aspect Calculations**: Automatic aspect detection with configurable orbs
- **Comprehensive Ephemeris Data**: Coverage from 1940-2050 with extensive asteroid data

## Quick Start

### Installation

The Swiss Ephemeris library is already installed:

```bash
npm install
```

### Ephemeris Data

The project includes comprehensive ephemeris data files covering:
- Main planets (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)
- Lunar nodes (Mean and True)
- Chiron
- Asteroid data (ep4 directory)
- Satellite data (sat directory)

### Usage

```typescript
import { initSwissEph } from './src/swisseph';

// Initialize Swiss Ephemeris
const swissEph = initSwissEph('./ephe');

// Calculate planetary positions
const date = new Date();
const longitude = -74.006; // New York
const latitude = 40.7128;

const planets = swissEph.calcPlanets(date, longitude, latitude);
const houses = swissEph.calcHouses(date, longitude, latitude);
const aspects = swissEph.calcAspects(planets, 8); // 8° orb
```

### Available Scripts

```bash
# Test the Swiss Ephemeris installation
npm run test-swisseph

# Run the example
npm run example

# Build the project
npm run build

# Start the development server
npm run dev
```

## API Reference

### `initSwissEph(ephePath)`

Initializes the Swiss Ephemeris library with the specified ephemeris data path.

### `calcPlanets(date, longitude, latitude)`

Calculates planetary positions for a given date and location.

Returns an array of `PlanetResult` objects:
```typescript
interface PlanetResult {
  name: string;      // Planet name
  sign: string;      // Zodiac sign
  longitude: number; // Ecliptic longitude in degrees
  retrograde: boolean; // Whether planet is retrograde
}
```

### `calcHouses(date, longitude, latitude, system?)`

Calculates house cusps and angles. Default system is Placidus ('P').

### `calcAspects(planets, orb?)`

Calculates aspects between planets with the specified orb (default 8°).

## Documentation

For detailed setup instructions and troubleshooting, see [SWISSEPH_README.md](./SWISSEPH_README.md).

## License

The Swiss Ephemeris library is licensed under the GNU General Public License v2.
