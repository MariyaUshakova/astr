import cities from './cities';

interface PlanetResult {
  name: string;
  sign: string;
  longitude: number;
  retrograde: boolean;
}

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

const form = document.getElementById('chart-form') as HTMLFormElement;
const tbody = document.querySelector('#results tbody') as HTMLTableSectionElement;
const cityInput = document.getElementById('city') as HTMLInputElement;
const datalist = document.getElementById('cities') as HTMLDataListElement;
const canvas = document.getElementById('chart') as HTMLCanvasElement;
const glCtx = canvas.getContext('webgl');
if (!glCtx) { throw new Error('WebGL not supported'); }
const gl: WebGLRenderingContext = glCtx;

// populate city list
cities.forEach(c => {
  const option = document.createElement('option');
  option.value = c.name;
  datalist.appendChild(option);
});

// WebGL setup
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

function buildTable(planets: PlanetResult[]) {
  tbody.innerHTML = '';
  planets.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${glyphs[p.name] || ''}</td><td>${p.name}</td><td>${p.sign}</td><td>${p.longitude.toFixed(2)}</td><td>${p.retrograde ? 'Yes' : 'No'}</td>`;
    tbody.appendChild(tr);
  });
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const data = {
    date: (document.getElementById('date') as HTMLInputElement).value,
    time: (document.getElementById('time') as HTMLInputElement).value,
    city: cityInput.value
  };
  const res = await fetch('/api/chart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  drawWheel();
  drawPlanets(json.planets);
  buildTable(json.planets);
});
