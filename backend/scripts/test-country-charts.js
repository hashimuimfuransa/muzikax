/**
 * Test script to verify country charts are fetching correct data
 * Run: node backend/scripts/test-country-charts.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

async function testCountryCharts() {
  try {
    console.log('🧪 Testing Country Charts Data\n');
    console.log('=' .repeat(60));
    
    // Connect to MongoDB to check data
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found');
      process.exit(1);
    }
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Check ListenerGeography data
    const ListenerGeography = require('../src/models/ListenerGeography');
    const totalRecords = await ListenerGeography.countDocuments();
    console.log(`📊 Total ListenerGeography records: ${totalRecords}`);
    
    // Get country breakdown
    const countryBreakdown = await ListenerGeography.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
          tracks: { $addToSet: '$trackId' }
        }
      },
      {
        $project: {
          country: '$_id',
          plays: '$count',
          uniqueTracks: { $size: '$tracks' },
          _id: 0
        }
      },
      {
        $sort: { plays: -1 }
      }
    ]);
    
    console.log('\n🌍 Country Breakdown:');
    countryBreakdown.slice(0, 10).forEach((c, idx) => {
      console.log(`   ${idx + 1}. ${c.country}: ${c.plays} plays, ${c.uniqueTracks} unique tracks`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🌐 Testing API Endpoints\n');
    
    // Test API endpoints
    const baseUrl = process.env.API_URL || 'http://localhost:5000';
    const testCountries = ['RW', 'US', 'KE'];
    
    for (const country of testCountries) {
      console.log(`\n📍 Testing ${country} charts:`);
      
      try {
        // Test weekly charts
        const response = await axios.get(`${baseUrl}/api/charts/${country}?timeWindow=weekly&limit=10`);
        
        if (response.status === 200) {
          const data = response.data;
          console.log(`   ✅ Status: ${response.status}`);
          console.log(`   📊 Tracks returned: ${data.charts?.length || 0}`);
          console.log(`   ⏱️  Query time: ${data.queryTimeMs}ms`);
          console.log(`   💾 Cached: ${data.cached || false}`);
          
          if (data.charts && data.charts.length > 0) {
            console.log(`\n   🎵 Top 3 tracks:`);
            data.charts.slice(0, 3).forEach((track, idx) => {
              console.log(`      ${idx + 1}. "${track.title}"`);
              console.log(`         Country plays: ${track.countryPlays || 0}`);
              console.log(`         Unique listeners: ${track.countryUniqueListeners || 0}`);
              console.log(`         Country score: ${track.countryScore?.toFixed(2) || 0}`);
            });
          } else {
            console.log(`   ⚠️  No tracks found for ${country}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        if (error.response) {
          console.log(`      Status: ${error.response.status}`);
          console.log(`      Data: ${JSON.stringify(error.response.data)}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Test complete!\n');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testCountryCharts();
