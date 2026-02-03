const express = require('express');
const userRoutes = require('./backend/src/routes/userRoutes');

// Create a simple test app
const app = express();

// Add middleware to parse JSON
app.use(express.json());

// Mount the user routes
app.use('/api/users', userRoutes.default);

// Add a simple test route
app.get('/test', (req, res) => {
  res.json({ message: 'Test server running' });
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log('Try accessing: http://localhost:3001/api/users/test');
});