// Test if profileController can be imported
try {
  const profileController = require('./src/controllers/profileController.ts');
  console.log('Profile controller imported successfully');
  console.log(Object.keys(profileController));
} catch (error) {
  console.error('Error importing profile controller:', error);
}