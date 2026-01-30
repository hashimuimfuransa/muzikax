const express = require('express');
const profileRoutes = require('./src/routes/profileRoutes');

console.log('Profile routes type:', typeof profileRoutes);
console.log('Profile routes keys:', Object.keys(profileRoutes || {}));

if (profileRoutes && typeof profileRoutes === 'function') {
  console.log('Profile routes is a function, testing...');
  
  // Create a simple Express app for testing
  const app = express();
  const port = 3002;
  
  // Register the profile routes
  app.use('/api/profile', profileRoutes);
  
  // Add a simple test route
  app.get('/test', (req, res) => {
    res.json({ message: 'Test route working' });
  });
  
  app.listen(port, () => {
    console.log(`Test server running on port ${port}`);
  });
} else {
  console.log('Profile routes is not a valid function');
}