// Client-side logic for the natal chart calculator
import cities from './cities';

console.log('Client script loaded');
console.log('Cities imported:', cities.length);

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
  Chiron: '⚷',
  Lilith: '⚸'
};

// Planet result interface
interface PlanetResult {
  name: string;
  sign: string;
  element: string;
  longitude: number;
  retrograde: boolean;
}

// Aspect interface
interface Aspect {
  planet1: string;
  planet2: string;
  aspect: string;
  orb: number;
  exact: number;
}

interface House {
  name: string;
  sign: string;
  longitude: number;
}

interface HousesResult {
  ascendant: number;
  mc: number;
  ic: number;
  desc: number;
  houses: House[];
}

function formatDMS(longitude: number): string {
  const pos = longitude % 30;
  const deg = Math.floor(pos);
  const minFloat = (pos - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60);
  return `${deg}\u00B0${min.toString().padStart(2, '0')}'${sec.toString().padStart(2, '0')}"`;
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing application...');
  init();
});

// Initialize the application
function init() {
  console.log('Initializing application...');
  
  // Get DOM elements
  const form = document.getElementById('chart-form') as HTMLFormElement;
  const yearSelect = document.getElementById('year') as HTMLSelectElement;
  const monthSelect = document.getElementById('month') as HTMLSelectElement;
  const daySelect = document.getElementById('day') as HTMLSelectElement;
  const hourSelect = document.getElementById('hour') as HTMLSelectElement;
  const minuteSelect = document.getElementById('minute') as HTMLSelectElement;
  const cityInput = document.getElementById('city') as HTMLInputElement;
  const datalist = document.getElementById('cities') as HTMLDataListElement;
  const calculateBtn = document.getElementById('calculate-btn') as HTMLButtonElement;
  const testDataBtn = document.getElementById('test-data') as HTMLDivElement;
  const loadingDiv = document.getElementById('loading') as HTMLDivElement;
  const resultsSection = document.getElementById('results-section') as HTMLDivElement;
  const aspectsSection = document.getElementById('aspects-section') as HTMLDivElement;
  const planetsTbody = document.getElementById('planets-tbody') as HTMLTableSectionElement;
  const housesTbody = document.getElementById('houses-tbody') as HTMLTableSectionElement;
  const aspectsGrid = document.getElementById('aspects-grid') as HTMLDivElement;
  const themeToggle = document.getElementById('theme-toggle') as HTMLButtonElement;
  const themeIcon = themeToggle?.querySelector('.theme-icon') as HTMLSpanElement;
  const canvas = document.getElementById('chart') as HTMLCanvasElement;

  console.log('DOM elements found:', {
    form: !!form,
    yearSelect: !!yearSelect,
    monthSelect: !!monthSelect,
    daySelect: !!daySelect,
    hourSelect: !!hourSelect,
    minuteSelect: !!minuteSelect,
    cityInput: !!cityInput,
    calculateBtn: !!calculateBtn,
    testDataBtn: !!testDataBtn,
    themeToggle: !!themeToggle,
    canvas: !!canvas
  });

  // Check if all required elements are found
  if (!yearSelect || !monthSelect || !daySelect || !hourSelect || !minuteSelect || !cityInput) {
    console.error('Required form elements not found!');
    alert('Error: Form elements not found. Please refresh the page.');
    return;
  }

  // WebGL setup
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  const glCtx = canvas.getContext('webgl');
  if (!glCtx) { 
    console.error('WebGL not supported');
    return;
  }
  const gl: WebGLRenderingContext = glCtx;

  // Populate form dropdowns with years, months, days, hours, minutes
  function populateFormDropdowns() {
    console.log('Populating form dropdowns...');
    
    // Clear existing options first
    yearSelect.innerHTML = '<option value="">Select year</option>';
    monthSelect.innerHTML = '<option value="">Select month</option>';
    daySelect.innerHTML = '<option value="">Select day</option>';
    hourSelect.innerHTML = '<option value="">Select hour</option>';
    minuteSelect.innerHTML = '<option value="">Select minute</option>';
    
    // Years (1940-2050)
    for (let year = 1940; year <= 2050; year++) {
      const option = document.createElement('option');
      option.value = year.toString();
      option.textContent = year.toString();
      yearSelect.appendChild(option);
    }
    console.log(`Added ${2050 - 1940 + 1} years to dropdown`);

    // Months
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    months.forEach((month, index) => {
      const option = document.createElement('option');
      option.value = (index + 1).toString().padStart(2, '0');
      option.textContent = month;
      monthSelect.appendChild(option);
    });
    console.log(`Added ${months.length} months to dropdown`);

    // Days (1-31)
    for (let day = 1; day <= 31; day++) {
      const option = document.createElement('option');
      option.value = day.toString().padStart(2, '0');
      option.textContent = day.toString();
      daySelect.appendChild(option);
    }
    console.log(`Added 31 days to dropdown`);

    // Hours (0-23)
    for (let hour = 0; hour <= 23; hour++) {
      const option = document.createElement('option');
      option.value = hour.toString().padStart(2, '0');
      option.textContent = hour.toString().padStart(2, '0');
      hourSelect.appendChild(option);
    }
    console.log(`Added 24 hours to dropdown`);

    // Minutes (0-59)
    for (let minute = 0; minute <= 59; minute++) {
      const option = document.createElement('option');
      option.value = minute.toString().padStart(2, '0');
      option.textContent = minute.toString().padStart(2, '0');
      minuteSelect.appendChild(option);
    }
    console.log(`Added 60 minutes to dropdown`);
  }

  // Populate city list for autocompletion
  function populateCityList() {
    console.log('Populating city list...');
    if (!datalist) {
      console.error('Datalist element not found');
      return;
    }
    
    datalist.innerHTML = '';
    cities.forEach(c => {
      const option = document.createElement('option');
      option.value = c.name;
      datalist.appendChild(option);
    });
    console.log(`Added ${cities.length} cities to datalist`);
  }

  // Setup event listeners
  function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    if (form) {
      form.addEventListener('submit', handleFormSubmit);
      console.log('Form submit listener added');
    }
    
    if (testDataBtn) {
      testDataBtn.addEventListener('click', fillTestData);
      console.log('Test data listener added');
    }
    
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
      console.log('Theme toggle listener added');
    }
  }

  // Fill test data
  function fillTestData() {
    console.log('Filling test data...');
    if (yearSelect) yearSelect.value = '1990';
    if (monthSelect) monthSelect.value = '10';
    if (daySelect) daySelect.value = '30';
    if (hourSelect) hourSelect.value = '14';
    if (minuteSelect) minuteSelect.value = '10';
    if (cityInput) cityInput.value = 'KHARKIV';
    console.log('Test data filled');
  }

  // Theme management
  function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  }

  function updateThemeIcon(theme: string) {
    if (themeIcon) {
      themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
  }

  // WebGL setup
  function setupWebGL() {
    console.log('Setting up WebGL...');
    
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

    // Store references for later use
    (window as any).gl = gl;
    (window as any).colorLoc = colorLoc;
  }

  // Draw the zodiac wheel and sign dividers
  function drawWheel() {
    const gl = (window as any).gl;
    const colorLoc = (window as any).colorLoc;
    
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

  // Plot planets on the wheel using their longitudes
  function drawPlanets(planets: PlanetResult[]) {
    const gl = (window as any).gl;
    const colorLoc = (window as any).colorLoc;
    
    planets.forEach(p => {
      const angle = (p.longitude * Math.PI) / 180;
      const r = 0.9;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x, y]), gl.STATIC_DRAW);
      
      if (p.retrograde) {
        gl.uniform4f(colorLoc, 1, 0, 0, 1); // Red for retrograde
      } else {
        gl.uniform4f(colorLoc, 0, 1, 0, 1); // Green for direct
      }
      gl.drawArrays(gl.POINTS, 0, 1);
    });
  }

  // Build the planets table
  function buildPlanetsTable(planets: PlanetResult[]) {
    if (!planetsTbody) return;
    
    planetsTbody.innerHTML = '';
    planets.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="planet-glyph">${glyphs[p.name] || ''}</span> ${p.name}</td>
        <td>${p.sign}</td>
        <td>${p.element}</td>
        <td>${p.longitude.toFixed(2)}°</td>
        <td class="${p.retrograde ? 'retrograde' : ''}">${p.retrograde ? 'Yes' : 'No'}</td>
      `;
      planetsTbody.appendChild(tr);
    });
  }

  function buildHousesTable(houses: House[]) {
    if (!housesTbody) return;
    housesTbody.innerHTML = '';
    houses.forEach(h => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${h.name}</td>
        <td>${h.sign}</td>
        <td>${formatDMS(h.longitude)}</td>
      `;
      housesTbody.appendChild(tr);
    });
  }

  // Build the aspects section
  function buildAspectsSection(aspects: Aspect[]) {
    if (!aspectsGrid) return;
    
    aspectsGrid.innerHTML = '';
    
    if (aspects.length === 0) {
      aspectsGrid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">No major aspects found within 8° orb.</p>';
      return;
    }
    
    aspects.forEach(aspect => {
      const card = document.createElement('div');
      card.className = 'aspect-card';
      card.innerHTML = `
        <div class="aspect-planets">${aspect.planet1} ${aspect.aspect} ${aspect.planet2}</div>
        <div class="aspect-type">${aspect.aspect}</div>
        <div class="aspect-orb">Orb: ${aspect.orb.toFixed(1)}°</div>
      `;
      aspectsGrid.appendChild(card);
    });
  }

  // Show/hide loading state
  function setLoading(loading: boolean) {
    if (loading) {
      loadingDiv?.classList.add('active');
      if (calculateBtn) {
        calculateBtn.disabled = true;
        calculateBtn.textContent = 'CALCULATING...';
      }
    } else {
      loadingDiv?.classList.remove('active');
      if (calculateBtn) {
        calculateBtn.disabled = false;
        calculateBtn.textContent = 'CALCULATE CHART';
      }
    }
  }

  // Handle form submission
  async function handleFormSubmit(e: Event) {
    e.preventDefault();
    console.log('Form submitted');
    
    const year = yearSelect?.value;
    const month = monthSelect?.value;
    const day = daySelect?.value;
    const hour = hourSelect?.value;
    const minute = minuteSelect?.value;
    const cityName = cityInput?.value;
    
    console.log('Form values:', { year, month, day, hour, minute, cityName });
    
    if (!year || !month || !day || !hour || !minute || !cityName) {
      alert('Please fill in all fields');
      return;
    }
    
    const loc = cities.find(c => c.name.toUpperCase() === cityName.toUpperCase());
    if (!loc) {
      alert('City not found. Please select a city from the list.');
      return;
    }
    
    // Create date object
    const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute)));
    
    setLoading(true);
    
    try {
      console.log('Making API request...');
      
      // Call the server API for calculations
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: date.toISOString(),
          longitude: loc.lon,
          latitude: loc.lat
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      
      const planets: PlanetResult[] = data.planets;
      const aspects: Aspect[] = data.aspects || [];
      const houses: HousesResult = data.houses;

      // Update the display
      const gl = (window as any).gl;
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      drawWheel();
      drawPlanets(planets);
      buildPlanetsTable(planets);
      if (houses) {
        buildHousesTable(houses.houses);
      }
      buildAspectsSection(aspects);

      // Show results
      if (resultsSection) {
        resultsSection.classList.add('active');
      }
      if (aspectsSection) {
        aspectsSection.style.display = aspects.length > 0 ? 'block' : 'none';
      }

      // Scroll to results
      resultsSection?.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error('Calculation failed:', error);
      alert('Calculation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Initialize everything
  populateFormDropdowns();
  populateCityList();
  setupEventListeners();
  setupWebGL();
  loadTheme();
  
  console.log('Application initialized successfully');
}
