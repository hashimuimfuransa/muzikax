// Test imports
console.log('Testing imports...');

try {
  const adminController = require('./src/controllers/adminController');
  console.log('adminController imported successfully');
  console.log('Functions available:', Object.keys(adminController));
} catch (error) {
  console.error('Error importing adminController:', error);
}

try {
  const adminRoutes = require('./src/routes/adminRoutes');
  console.log('adminRoutes imported successfully');
} catch (error) {
  console.error('Error importing adminRoutes:', error);
}