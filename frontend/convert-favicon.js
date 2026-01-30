const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

// Read the PNG file
const pngBuffer = fs.readFileSync(path.join(__dirname, 'public', 'muzikax.png'));

// Convert to ICO and save
toIco([pngBuffer])
  .then(buf => {
    fs.writeFileSync(path.join(__dirname, 'public', 'favicon.ico'), buf);
    fs.writeFileSync(path.join(__dirname, 'src', 'app', 'favicon.ico'), buf);
    console.log('Favicon converted successfully!');
  })
  .catch(err => {
    console.error('Error converting favicon:', err);
  });