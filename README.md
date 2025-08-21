# astr

Minimal TypeScript web application that calculates an astrological natal chart using the [Swiss Ephemeris](https://www.astro.com/swisseph/).

## Development

1. Install dependencies
   ```bash
   npm install
   ```
2. Download Swiss Ephemeris data files and place them in the `ephemeris` folder (ignored by git).
3. Build the TypeScript sources
   ```bash
   npm run build
   ```
4. Start the server
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` in a browser and enter your birth data.

The application accepts date, time and a selection of major world cities (including Kharkiv, Kyiv and Odessa). It returns planetary positions, draws a WebGL natal chart and displays a table with zodiac sign, longitude and retrograde status for each body.
