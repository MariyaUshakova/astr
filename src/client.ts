// Client-side logic for drawing the natal chart
import cities from './cities';
import { initSwissEph, PlanetResult } from './swisseph';
import { calcFallback } from './fallback';

// Unicode glyphs for each body for display in the results table
const glyphs: Record<string, string> = {
  Sun: '☉',
  Moon: '☾',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  'Mean Node': '☊',
  'True Node': '☋',
  Chiron: '⚷'
};

// Grab references to DOM elements we interact with
const form = document.getElementById('chart-form') as HTMLFormElement;
const tbody = document.querySelector('#results tbody') as HTMLTableSectionElement;
const cityInput = document.getElementById('city') as HTMLInputElement;
const datalist = document.getElementById('cities') as HTMLDataListElement;
const canvas = document.getElementById('chart') as HTMLCanvasElement;
const glCtx = canvas.getContext('webgl');
if (!glCtx) { throw new Error('WebGL not supported'); }
const gl: WebGLRenderingContext = glCtx;

// Populate city list for autocompletion
cities.forEach(c => {
  const option = document.createElement('option');
  option.value = c.name;
  datalist.appendChild(option);
});

// Basic WebGL shader setup
const vertexSrc = `
attribute vec2 position;
void main(){
  gl_Position = vec4(position,0.0,1.0);
  gl_PointSize = 6.0;
}`;
const fragSrc = `
precision mediump float;
uniform vec4 color;
void main(){
  gl_FragColor = color;
}`;
function compileShader(src: string, type: number): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}
const program = gl.createProgram()!;
gl.attachShader(program, compileShader(vertexSrc, gl.VERTEX_SHADER));
gl.attachShader(program, compileShader(fragSrc, gl.FRAGMENT_SHADER));
gl.linkProgram(program);
gl.useProgram(program);
const posLoc = gl.getAttribLocation(program, 'position');
const colorLoc = gl.getUniformLocation(program, 'color');
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.enableVertexAttribArray(posLoc);
gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

// Draw the zodiac wheel and sign dividers
function drawWheel() {
  const segments = 360;
  const verts: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    verts.push(Math.cos(a), Math.sin(a));
  }
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  gl.uniform4f(colorLoc, 1, 1, 1, 1);
  gl.drawArrays(gl.LINE_LOOP, 0, segments);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const line = new Float32Array([0, 0, Math.cos(a), Math.sin(a)]);
    gl.bufferData(gl.ARRAY_BUFFER, line, gl.STATIC_DRAW);
    gl.drawArrays(gl.LINES, 0, 2);
  }
}

drawWheel();

// Plot planets on the wheel using their longitudes
function drawPlanets(planets: PlanetResult[]) {
  planets.forEach(p => {
    const angle = (p.longitude * Math.PI) / 180;
    const r = 0.9;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x, y]), gl.STATIC_DRAW);
    if (p.retrograde) {
      gl.uniform4f(colorLoc, 1, 0, 0, 1);
    } else {
      gl.uniform4f(colorLoc, 0, 1, 0, 1);
    }
    gl.drawArrays(gl.POINTS, 0, 1);
  });
}

// Build the HTML table showing calculation results
function buildTable(planets: PlanetResult[]) {
  tbody.innerHTML = '';
  planets.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${glyphs[p.name] || ''}</td><td>${p.name}</td><td>${p.sign}</td><td>${p.longitude.toFixed(2)}</td><td>${p.retrograde ? 'Yes' : 'No'}</td>`;
    tbody.appendChild(tr);
  });
}

// Handle form submission: perform calculations and redraw
form.addEventListener('submit', async e => {
  e.preventDefault();
  const dateStr = (document.getElementById('date') as HTMLInputElement).value;
  const timeStr = (document.getElementById('time') as HTMLInputElement).value;
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const cityName = cityInput.value;
  const loc = cities.find(c => c.name === cityName);
  if (!loc) {
    alert('Unknown city');
    return;
  }
  let planets: PlanetResult[];
  try {
    const mod = await initSwissEph('.');
    planets = mod.calcPlanets(date, loc.lon, loc.lat);
  } catch (err) {
    console.error('Swiss Ephemeris WASM failed, using fallback', err);
    planets = calcFallback(date, loc.lon, loc.lat);
  }
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawWheel();
  drawPlanets(planets);
  buildTable(planets);
});
