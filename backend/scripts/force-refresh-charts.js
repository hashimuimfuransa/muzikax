/**
 * Force refresh chart scores script
 * This script manually triggers chart score calculation to ensure fresh data
 * 
 * Usage: node backend/scripts/force-refresh-charts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { updateChartScores } = require('../src/services/chartService');

async function forceRefreshCharts() {
  try {
    console.log('🔄 Force refreshing chart scores...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables');
      process.exit(1);
    }
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Update all time windows
    const timeWindows = ['daily', 'weekly', 'monthly'];
    
    for (const timeWindow of timeWindows) {
      console.log(`📊 Updating ${timeWindow} charts...`);
      const startTime = Date.now();
      
      try {
        await updateChartScores(timeWindow);
        const duration = Date.now() - startTime;
        console.log(`✅ ${timeWindow} charts updated in ${duration}ms\n`);
      } catch (error) {
        console.error(`❌ Error updating ${timeWindow} charts:`, error.message);
      }
    }
    
    console.log('\n✅ Chart score refresh complete!');
    console.log('💡 Charts will now show updated data from the database');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

forceRefreshCharts();
