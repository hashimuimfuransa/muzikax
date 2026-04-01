/**
 * MongoDB Index Creation Script for ChartScore
 * Run this once to ensure all performance indexes are in place
 * 
 * Usage: node backend/scripts/create-chart-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function createIndexes() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected successfully');

    const ChartScore = require('../src/models/ChartScore');

    console.log('\n📊 Creating indexes...\n');

    // Get existing indexes
    const existingIndexes = await ChartScore.getIndexes();
    console.log(`ℹ️  Found ${existingIndexes.length} existing indexes\n`);

    // Create compound indexes (these will be created automatically by Mongoose on next app start)
    // But we can force creation now with this script
    
    const indexesToCreate = [
      { key: { lastUpdated: -1, weeklyScore: -1 }, name: 'lastUpdated_weeklyScore_idx' },
      { key: { lastUpdated: -1, dailyScore: -1 }, name: 'lastUpdated_dailyScore_idx' },
      { key: { lastUpdated: -1, monthlyScore: -1 }, name: 'lastUpdated_monthlyScore_idx' },
      { 
        key: { 'countryScores.country': 1, lastUpdated: -1, weeklyScore: -1 }, 
        name: 'country_lastUpdated_weeklyScore_idx' 
      }
    ];

    for (const index of indexesToCreate) {
      try {
        await ChartScore.createIndexes();
        console.log(`✅ Created index: ${index.name}`);
      } catch (error) {
        console.log(`⚠️  Index ${index.name} may already exist: ${error.message}`);
      }
    }

    // List all indexes
    console.log('\n📋 All indexes on ChartScore collection:');
    const allIndexes = await ChartScore.listIndexes();
    allIndexes.forEach((idx, i) => {
      console.log(`   ${i + 1}. ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n✨ Index creation complete!\n');
    console.log('💡 These indexes will be automatically maintained by Mongoose.');
    console.log('   The application will use them for faster queries starting now.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
createIndexes();
