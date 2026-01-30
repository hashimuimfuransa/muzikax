// Test file to check if imports work
console.log('Testing imports...');

try {
  console.log('Importing favoriteRoutes...');
  const favoriteRoutes = require('./dist/routes/features/favoriteRoutes');
  console.log('favoriteRoutes imported successfully:', !!favoriteRoutes);
} catch (error) {
  console.error('Error importing favoriteRoutes:', error);
}

try {
  console.log('Importing playlistRoutes...');
  const playlistRoutes = require('./dist/routes/features/playlistRoutes');
  console.log('playlistRoutes imported successfully:', !!playlistRoutes);
} catch (error) {
  console.error('Error importing playlistRoutes:', error);
}