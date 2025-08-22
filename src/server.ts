import express from 'express';
import path from 'path';
import { initSwissEph, ElementCount } from './swisseph';

// Simple Express server serving static assets and compiled JS
const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(__dirname));

// Parse JSON bodies
app.use(express.json());

// Initialize Swiss Ephemeris
const swissEph = initSwissEph('./ephe');

// API endpoint for calculating planetary positions
app.post('/api/calculate', (req, res) => {
  try {
    const { date, longitude, latitude } = req.body;
    
    if (!date || longitude === undefined || latitude === undefined) {
      return res.status(400).json({ error: 'Missing required parameters: date, longitude, latitude' });
    }

    const calculationDate = new Date(date);
    
    // Calculate planetary positions
    const planets = swissEph.calcPlanets(calculationDate, longitude, latitude);
    
    // Calculate houses
    const houses = swissEph.calcHouses(calculationDate, longitude, latitude);
    
    // Calculate aspects
    const aspects = swissEph.calcAspects(planets, 8);
    
    // Count elements
    const elementCounts = swissEph.countElements(planets);
    
    res.json({
      planets,
      houses,
      aspects,
      elementCounts,
      date: calculationDate.toISOString(),
      location: { longitude, latitude }
    });
    
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Swiss Ephemeris initialized with ephemeris data`);
});
