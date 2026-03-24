/**
 * Seed script to create sample listener geography data for Rwanda (RW)
 * This will populate test data so country charts work properly
 * Run: node seed-country-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function seedCountryData() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MongoDB URI not found in environment variables');
      return;
    }
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const ListenerGeography = require('./src/models/ListenerGeography');
    const Track = require('./src/models/Track');
    const ChartScore = require('./src/models/ChartScore');

    // Get some existing tracks
    const tracks = await Track.find({ isPublic: { $ne: false } })
      .limit(20)
      .lean();

    if (tracks.length === 0) {
      console.log('❌ No tracks found in database. Please upload some tracks first.');
      return;
    }

    console.log(`📊 Found ${tracks.length} tracks to seed data for\n`);

    // Sample Rwandan IP addresses (fictional for testing)
    const rwandanIPs = [
      '41.186.4.1',
      '41.186.4.2',
      '41.186.4.3',
      '41.186.5.1',
      '41.186.5.2',
      '196.201.128.1',
      '196.201.128.2',
      '196.201.129.1'
    ];

    // Sample cities in Rwanda
    const rwandaCities = [
      { city: 'Kigali', region: 'Kigali', lat: -1.9536, lon: 30.0606 },
      { city: 'Butare', region: 'Huye', lat: -2.5967, lon: 29.7397 },
      { city: 'Gitarama', region: 'Muhanga', lat: -2.0744, lon: 29.7567 },
      { city: 'Ruhengeri', region: 'Musanze', lat: -1.4997, lon: 29.6333 },
      { city: 'Gisenyi', region: 'Rubavu', lat: -1.7028, lon: 29.2564 }
    ];

    // Create listener geography records
    const geoRecords = [];
    
    for (const track of tracks) {
      // Create 5-15 plays per track from Rwanda
      const numPlays = Math.floor(Math.random() * 10) + 5;
      
      for (let i = 0; i < numPlays; i++) {
        const ip = rwandanIPs[Math.floor(Math.random() * rwandanIPs.length)];
        const location = rwandaCities[Math.floor(Math.random() * rwandaCities.length)];
        
        geoRecords.push({
          trackId: track._id,
          creatorId: track.creatorId,
          ipAddress: ip,
          country: 'RW',
          region: location.region,
          city: location.city,
          latitude: location.lat,
          longitude: location.lon,
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        });
      }
    }

    console.log(`📍 Creating ${geoRecords.length} listener geography records for Rwanda...\n`);

    // Insert all records
    await ListenerGeography.insertMany(geoRecords);
    console.log('✅ Successfully inserted listener geography data\n');

    // Now update ChartScore with country-specific data
    console.log('📊 Updating ChartScore with country data...\n');

    const chartUpdates = [];
    
    for (const track of tracks) {
      // Calculate country-specific stats
      const countryStats = await ListenerGeography.aggregate([
        {
          $match: {
            trackId: track._id,
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

      if (countryStats.length > 0) {
        const stats = countryStats[0];
        const countryScore = (stats.plays * 0.6) + (stats.uniqueListeners.length * 0.4);
        
        chartUpdates.push({
          updateOne: {
            filter: { trackId: track._id },
            update: {
              $set: {
                weeklyScore: track.plays || stats.plays,
                totalPlays: track.plays || 0,
                uniqueListeners: stats.uniqueListeners.length,
                likes: track.likes || 0,
                shares: track.shares || 0,
                reposts: track.reposts || 0,
                playlistAdditions: track.playlistAdditions || 0,
                globalRank: Math.floor(Math.random() * 50) + 1,
                lastUpdated: new Date(),
                calculatedAt: new Date()
              }
            },
            upsert: true
          }
        });
      }
    }

    if (chartUpdates.length > 0) {
      await ChartScore.bulkWrite(chartUpdates);
      console.log(`✅ Updated ChartScore for ${chartUpdates.length} tracks\n`);
    }

    // Verify the data
    const rwandaCount = await ListenerGeography.countDocuments({ country: 'RW' });
    const chartCount = await ChartScore.countDocuments();
    
    console.log('=== SEED COMPLETE ===');
    console.log(`✅ Rwanda listener records: ${rwandaCount}`);
    console.log(`✅ ChartScore records: ${chartCount}`);
    console.log('\n🎯 Country charts for RW should now work!');
    console.log('📝 Note: Cache will be invalidated automatically on next API call');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedCountryData();
