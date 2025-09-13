const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the Shaka Player library from node_modules
app.use('/shaka', express.static(path.join(__dirname, 'node_modules/shaka-player/dist')));

// A simple root route to send the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`✨ Sleek Shaka Player running at http://localhost:${PORT}`);
});