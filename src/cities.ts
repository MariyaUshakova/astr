export interface City {
  name: string;
  lat: number;
  lon: number;
}

const cities: City[] = [
  { name: 'New York, USA', lat: 40.7128, lon: -74.006 },
  { name: 'London, UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris, France', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Kharkiv, Ukraine', lat: 49.9935, lon: 36.2304 },
  { name: 'Kyiv, Ukraine', lat: 50.4501, lon: 30.5234 },
  { name: 'Odessa, Ukraine', lat: 46.4825, lon: 30.7233 },
  { name: 'Moscow, Russia', lat: 55.7558, lon: 37.6176 },
  { name: 'Beijing, China', lat: 39.9042, lon: 116.4074 },
  { name: 'Delhi, India', lat: 28.7041, lon: 77.1025 },
  { name: 'Rio de Janeiro, Brazil', lat: -22.9068, lon: -43.1729 },
  { name: 'Cape Town, South Africa', lat: -33.9249, lon: 18.4241 },
  { name: 'Toronto, Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Mexico City, Mexico', lat: 19.4326, lon: -99.1332 }
];

export default cities;
