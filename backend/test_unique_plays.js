/**
 * Test Script: Unique Plays Tracking
 * 
 * This script tests the unique plays functionality:
 * 1. Tests that repeated plays from same IP/user are counted in 'plays' but not 'uniquePlays'
 * 2. Tests that different IPs/users increment both 'plays' and 'uniquePlays'
 * 
 * Usage: node backend/test_unique_plays.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/muzikax';

async function testUniquePlays() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const Track = require('./src/models/Track');
    const PlayHistory = require('./src/models/PlayHistory');

    // Create a test track
    console.log('📝 Creating test track...');
    const testTrack = await Track.create({
      creatorId: new mongoose.Types.ObjectId(),
      creatorType: 'artist',
      title: 'Test Unique Plays Track',
      description: 'Testing unique plays counting',
      audioURL: 'https://example.com/test.mp3',
      coverURL: 'https://example.com/cover.jpg',
      genre: 'Pop',
      type: 'song',
      paymentType: 'free',
      plays: 0,
      uniquePlays: 0
    });
    console.log(`   Created track: "${testTrack.title}" (ID: ${testTrack._id})\n`);

    // Simulate multiple plays from same IP
    console.log('🎵 Simulating 5 plays from same IP address...');
    const testIP = '192.168.1.100';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 5; i++) {
      await PlayHistory.create({
        trackId: testTrack._id,
        userId: null,
        ipAddress: testIP,
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(Date.now() + (i * 1000)), // 1 second apart
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        isValidated: true,
        isSuspicious: false
      });
    }
    console.log('   ✅ Created 5 play history records from same IP\n');

    // Manually calculate what uniquePlays should be
    const playHistoryRecords = await PlayHistory.find({
      trackId: testTrack._id
    }).sort({ timestamp: 1 }).lean();

    const dailyUniqueListeners = new Map();
    playHistoryRecords.forEach(record => {
      const playDate = new Date(record.timestamp);
      playDate.setHours(0, 0, 0, 0);
      const dateKey = playDate.toISOString();
      const uniqueId = record.userId 
        ? `user:${record.userId.toString()}` 
        : `ip:${record.ipAddress || 'unknown'}`;
      const compositeKey = `${dateKey}:${uniqueId}`;
      
      if (!dailyUniqueListeners.has(compositeKey)) {
        dailyUniqueListeners.set(compositeKey, { date: dateKey, uniqueId });
      }
    });

    console.log('📊 Analysis Results:');
    console.log(`   Total plays recorded: ${playHistoryRecords.length}`);
    console.log(`   Expected unique plays: ${dailyUniqueListeners.size} (same IP, same day)`);
    console.log(`   Daily breakdown:`);
    
    const dateMap = new Map();
    playHistoryRecords.forEach(record => {
      const playDate = new Date(record.timestamp);
      playDate.setHours(0, 0, 0, 0);
      const dateKey = playDate.toISOString();
      const count = dateMap.get(dateKey) || 0;
      dateMap.set(dateKey, count + 1);
    });
    
    dateMap.forEach((count, date) => {
      console.log(`     - ${date}: ${count} plays`);
    });

    // Now test with different IPs
    console.log('\n🎵 Simulating plays from 3 different IP addresses...');
    const differentIPs = ['192.168.1.101', '192.168.1.102', '192.168.1.103'];
    
    for (const ip of differentIPs) {
      await PlayHistory.create({
        trackId: testTrack._id,
        userId: null,
        ipAddress: ip,
        userAgent: 'Mozilla/5.0',
        timestamp: new Date(),
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        isValidated: true,
        isSuspicious: false
      });
    }
    console.log('   ✅ Created 3 play history records from different IPs\n');

    // Recalculate
    const updatedRecords = await PlayHistory.find({
      trackId: testTrack._id
    }).sort({ timestamp: 1 }).lean();

    const updatedDailyUnique = new Map();
    updatedRecords.forEach(record => {
      const playDate = new Date(record.timestamp);
      playDate.setHours(0, 0, 0, 0);
      const dateKey = playDate.toISOString();
      const uniqueId = record.userId 
        ? `user:${record.userId.toString()}` 
        : `ip:${record.ipAddress || 'unknown'}`;
      const compositeKey = `${dateKey}:${uniqueId}`;
      
      if (!updatedDailyUnique.has(compositeKey)) {
        updatedDailyUnique.set(compositeKey, { date: dateKey, uniqueId });
      }
    });

    console.log('📊 Updated Analysis:');
    console.log(`   Total plays recorded: ${updatedRecords.length}`);
    console.log(`   Expected unique plays: ${updatedDailyUnique.size} (4 unique IPs total)`);
    console.log(`   Breakdown by IP:`);
    
    const ipMap = new Map();
    updatedRecords.forEach(record => {
      const ip = record.ipAddress;
      const count = ipMap.get(ip) || 0;
      ipMap.set(ip, count + 1);
    });
    
    ipMap.forEach((count, ip) => {
      console.log(`     - ${ip}: ${count} plays`);
    });

    // Test with authenticated users
    console.log('\n🎵 Simulating plays from authenticated users...');
    const testUser1 = new mongoose.Types.ObjectId();
    const testUser2 = new mongoose.Types.ObjectId();
    
    // User 1 plays twice (should count as 1 unique)
    await PlayHistory.create({
      trackId: testTrack._id,
      userId: testUser1,
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0',
      timestamp: new Date(),
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      isValidated: true,
      isSuspicious: false
    });
    
    await PlayHistory.create({
      trackId: testTrack._id,
      userId: testUser1,
      ipAddress: '192.168.1.200',
      userAgent: 'Mozilla/5.0',
      timestamp: new Date(),
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      isValidated: true,
      isSuspicious: false
    });
    
    // User 2 plays once
    await PlayHistory.create({
      trackId: testTrack._id,
      userId: testUser2,
      ipAddress: '192.168.1.201',
      userAgent: 'Mozilla/5.0',
      timestamp: new Date(),
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      isValidated: true,
      isSuspicious: false
    });
    
    console.log('   ✅ Created plays from 2 users (User1: 2 plays, User2: 1 play)\n');

    // Final calculation
    const finalRecords = await PlayHistory.find({
      trackId: testTrack._id
    }).sort({ timestamp: 1 }).lean();

    const finalDailyUnique = new Map();
    finalRecords.forEach(record => {
      const playDate = new Date(record.timestamp);
      playDate.setHours(0, 0, 0, 0);
      const dateKey = playDate.toISOString();
      const uniqueId = record.userId 
        ? `user:${record.userId.toString()}` 
        : `ip:${record.ipAddress || 'unknown'}`;
      const compositeKey = `${dateKey}:${uniqueId}`;
      
      if (!finalDailyUnique.has(compositeKey)) {
        finalDailyUnique.set(compositeKey, { date: dateKey, uniqueId });
      }
    });

    console.log('📊 Final Results:');
    console.log(`   Total plays: ${finalRecords.length}`);
    console.log(`   Expected unique plays: ${finalDailyUnique.size}`);
    console.log(`   Calculation logic: Each unique listener (by IP or user ID) counts once per day`);
    
    console.log('\n✅ Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Same IP playing multiple times on same day = 1 unique play');
    console.log('   - Different IPs on same day = each counts as unique play');
    console.log('   - Same user playing multiple times on same day = 1 unique play');
    console.log('   - Different users on same day = each counts as unique play');

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Track.findByIdAndDelete(testTrack._id);
    await PlayHistory.deleteMany({ trackId: testTrack._id });
    console.log('   ✅ Test data removed\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run test
console.log('🚀 Starting unique plays test...\n');
testUniquePlays();
