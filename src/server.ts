import express from 'express';
import path from 'path';

// Simple Express server serving static assets and compiled JS
const app = express();
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(__dirname));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
