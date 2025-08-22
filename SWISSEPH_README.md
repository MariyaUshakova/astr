# Swiss Ephemeris Setup Guide

This project now includes the Swiss Ephemeris library for high-precision astrological calculations.

## Installation

The Swiss Ephemeris library has been installed via npm:

```bash
npm install swisseph
```

## Setting Up Ephemeris Data

To use Swiss Ephemeris, you need to download ephemeris data files. These files contain the orbital elements and positions of celestial bodies.

### Option 1: Download from Astrodienst (Recommended)

1. Visit: https://www.astro.com/ftp/swisseph/ephe/
2. Download the following files (at minimum):
   - `seas_18.se1` - Main ephemeris file (Sun, Moon, planets)
   - `semo_18.se1` - Moon ephemeris
   - `sepl_18.se1` - Pluto ephemeris
   - `seas_18.se1m` - Main ephemeris file (compressed)
   - `semo_18.se1m` - Moon ephemeris (compressed)
   - `sepl_18.se1m` - Pluto ephemeris (compressed)

### Option 2: Download from Swiss Ephemeris GitHub

1. Visit: https://github.com/aloistr/swisseph/tree/master/ephe
2. Download the ephemeris files from the repository

### Setup Steps

1. Create an `ephe` directory in your project root:
   ```bash
   mkdir ephe
   ```

2. Place the downloaded ephemeris files in the `ephe` directory

3. Your project structure should look like:
   ```
   your-project/
   ├── ephe/
   │   ├── seas_18.se1
   │   ├── semo_18.se1
   │   ├── sepl_18.se1
   │   └── ... (other ephemeris files)
   ├── src/
   ├── package.json
   └── ...
   ```

## Usage

### Basic Example

```typescript
import { initSwissEph } from './src/swisseph';

// Initialize Swiss Ephemeris
const swissEph = initSwissEph('./ephe');

// Calculate planetary positions
const date = new Date();
const longitude = -74.006; // New York
const latitude = 40.7128;

const planets = swissEph.calcPlanets(date, longitude, latitude);

// Calculate house cusps
const houses = swissEph.calcHouses(date, longitude, latitude);

// Calculate aspects
const aspects = swissEph.calcAspects(planets, 8); // 8° orb
```

### Available Functions

#### `calcPlanets(date, longitude, latitude)`
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

#### `calcHouses(date, longitude, latitude, system?)`
Calculates house cusps and angles.

Returns:
```typescript
{
  ascendant: number;        // Ascendant in degrees
  mc: number;              // Midheaven in degrees
  armc: number;            // ARMC in degrees
  vertex: number;          // Vertex in degrees
  equatorialAscendant: number; // Equatorial Ascendant
  houseCusps: number[];    // House cusps 1-12
}
```

#### `calcAspects(planets, orb?)`
Calculates aspects between planets.

Returns an array of aspect objects:
```typescript
{
  planet1: string;   // First planet
  planet2: string;   // Second planet
  aspect: string;    // Aspect type (Conjunction, Opposition, etc.)
  orb: number;       // Orb in degrees
  exact: number;     // Exact aspect angle
}
```

## Running the Example

To test the installation:

```bash
# Compile TypeScript
npm run build

# Run the example
node dist/example.js
```

Or run directly with ts-node:

```bash
npx ts-node src/example.ts
```

## Troubleshooting

### Common Issues

1. **"Cannot find ephemeris files" error**
   - Make sure you've downloaded the ephemeris files
   - Verify the `ephe` directory exists in your project root
   - Check that the file paths are correct

2. **"Module not found" error**
   - Run `npm install` to ensure all dependencies are installed
   - Check that `swisseph` is listed in your `package.json`

3. **Calculation errors**
   - Verify your date is within the range covered by your ephemeris files
   - Check that longitude and latitude are valid numbers
   - Ensure you're using the correct coordinate system

### Ephemeris File Coverage

- `seas_18.se1`: 1800-2050 (main planets)
- `semo_18.se1`: 1800-2050 (Moon)
- `sepl_18.se1`: 1800-2050 (Pluto)

For dates outside this range, you'll need different ephemeris files.

## Additional Resources

- [Swiss Ephemeris Documentation](https://www.astro.com/swisseph/swephinfo_e.htm)
- [Astrodienst Ephemeris Files](https://www.astro.com/ftp/swisseph/ephe/)
- [Swiss Ephemeris GitHub Repository](https://github.com/aloistr/swisseph)

## License

The Swiss Ephemeris library is licensed under the GNU General Public License v2. Please refer to the original Swiss Ephemeris documentation for licensing details.
