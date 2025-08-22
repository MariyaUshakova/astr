# astr

Minimal TypeScript web application that calculates an astrological natal chart using the [Swiss Ephemeris](https://www.astro.com/swisseph/).

## Development

1. Install dependencies
   ```bash
   npm install
   ```
2. Download Swiss Ephemeris data files and place them in the `ephemeris` folder (ignored by git).
3. Compile the Swiss Ephemeris C sources to WebAssembly. The `swisseph.js` and `swisseph.wasm` files are generated in `public/` and are ignored by git:
   ```bash
   emcc -I ./swisseph sweph.c swephexp.c swephlib.c swedate.c \
        -o public/swisseph.js \
        -s MODULARIZE=1 -s EXPORT_NAME="createSwissEphModule" \
        -s EXPORTED_FUNCTIONS="['_swe_julday','_swe_calc_ut','_swe_set_ephe_path','_swe_set_topo','_swe_get_planet_name','_swe_close']" \
        -s EXPORTED_RUNTIME_METHODS="['ccall','cwrap']"
   ```
   Adjust the list of C files if needed and ensure the `.se1` data files are copied into `public/` alongside the generated artifacts.
4. Build the TypeScript sources
   ```bash
   npm run build
   ```
5. Start the server
   ```bash
   npm start
   ```
6. Open `http://localhost:3000` in a browser and enter your birth data.

The application accepts date, time and a selection of major world cities (including Kharkiv, Kyiv and Odessa). It returns planetary positions, draws a WebGL natal chart and displays a table with zodiac sign, longitude and retrograde status for each body.
