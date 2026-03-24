/**
 * Debug script to check why country charts (RW) are empty
 * Run: node debug-country-charts.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function debugCountryCharts() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables');
      return;
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Check 1: Count ListenerGeography records
    const ListenerGeography = require('./src/models/ListenerGeography');
    const totalGeoRecords = await ListenerGeography.countDocuments();
    console.log(`📍 Total ListenerGeography records: ${totalGeoRecords}`);

    // Check 2: Count records for Rwanda (RW)
    const rwandaRecords = await ListenerGeography.countDocuments({ country: 'RW' });
    console.log(`🇷🇼 Records for Rwanda (RW): ${rwandaRecords}`);

    // Check 3: Show sample of countries in the database
    const countries = await ListenerGeography.distinct('country');
    console.log('\n🌍 Countries in database:', countries.slice(0, 20));
    console.log(`Total unique countries: ${countries.length}`);

    // Check 4: Check ChartScore data
    const ChartScore = require('./src/models/ChartScore');
    const totalChartScores = await ChartScore.countDocuments();
    console.log(`\n📊 Total ChartScore records: ${totalChartScores}`);

    // Check 5: Sample ChartScore data
    const sampleCharts = await ChartScore.findOne().lean();
    if (sampleCharts) {
      console.log('\n📈 Sample ChartScore document:');
      console.log(JSON.stringify(sampleCharts, null, 2));
    } else {
      console.log('\n⚠️ No ChartScore documents found!');
    }

    // Check 6: Check Track data
    const Track = require('./src/models/Track');
    const totalTracks = await Track.countDocuments();
    console.log(`\n🎵 Total tracks: ${totalTracks}`);

    // Check 7: Sample tracks with plays
    const tracksWithPlays = await Track.find({ plays: { $gt: 0 } })
      .select('title creatorId plays likes shares')
      .limit(5)
      .lean();
    
    console.log('\n🎵 Sample tracks with plays:');
    tracksWithPlays.forEach(track => {
      console.log(`  - "${track.title}" - Plays: ${track.plays}, Likes: ${track.likes}`);
    });

    // Check 8: Test aggregation query used by getCountryCharts
    if (tracksWithPlays.length > 0) {
      const testTrackId = tracksWithPlays[0]._id;
      console.log(`\n🔍 Testing aggregation for track: ${tracksWithPlays[0].title}`);
      
      const countryStats = await ListenerGeography.aggregate([
        {
          $match: {
            trackId: testTrackId,
            country: 'RW'
          }
        },
        {
          $group: {
            _id: '$trackId',
            plays: { $sum: 1 },
            uniqueListeners: { $addToSet: '$ipAddress' }
          }
        }
      ]);
      
      console.log('Result for RW:', countryStats);
      
      // Try without country filter
      const allStats = await ListenerGeography.aggregate([
        {
          $match: {
            trackId: testTrackId
          }
        },
        {
          $group: {
            _id: '$trackId',
            plays: { $sum: 1 },
            uniqueListeners: { $addToSet: '$ipAddress' },
            countries: { $addToSet: '$country' }
          }
        }
      ]);
      
      console.log('All stats for this track:', allStats);
    }

    // Check 9: DailyStats
    const DailyStats = require('./src/models/DailyStats');
    const todayStats = await DailyStats.countDocuments({
      date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    console.log(`\n📅 Today's DailyStats records: ${todayStats}`);

    console.log('\n✅ Debug complete!');
    
    // Summary
    console.log('\n=== SUMMARY ===');
    if (rwandaRecords === 0) {
      console.log('❌ PROBLEM: No listener geography data for Rwanda (RW)');
      console.log('   Solution: Tracks need to be played from Rwandan IP addresses');
      console.log('   OR: Use the seed script to create sample data');
    } else {
      console.log(`✅ Rwanda has ${rwandaRecords} play records`);
    }
    
    if (totalChartScores === 0) {
      console.log('❌ PROBLEM: No ChartScore data exists');
      console.log('   Solution: Run the chart score calculation job');
    } else {
      console.log(`✅ ChartScore has ${totalChartScores} documents`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

debugCountryCharts();
