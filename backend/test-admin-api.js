const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model correctly
const User = require('./src/models/User').default;

// Test credentials
const ADMIN_EMAIL = 'admin@muzikax.com';
const ADMIN_PASSWORD = 'admin123';

// JWT secrets (should match your .env)
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret_key';

async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

async function createTestAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully');
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return null;
  }
}

function generateTestToken(user) {
  const payload = {
    id: user._id,
    role: user.role,
    creatorType: user.creatorType
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '1h' });
}

async function testAdminEndpoint() {
  try {
    // Connect to database
    await connectDB();
    
    // Create or get admin user
    const adminUser = await createTestAdmin();
    if (!adminUser) {
      console.log('Failed to create/get admin user');
      process.exit(1);
    }

    // Generate token
    const token = generateTestToken(adminUser);
    console.log('Generated token:', token.substring(0, 20) + '...');

    // Test the admin analytics endpoint
    const response = await fetch('http://localhost:5000/api/admin/analytics', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Admin analytics data fetched successfully');
      console.log('Sample data:', {
        totalUsers: data.totalUsers,
        totalCreators: data.totalCreators,
        totalTracks: data.totalTracks
      });
    } else {
      const errorText = await response.text();
      console.error('Failed to fetch admin analytics:', response.status, errorText);
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error testing admin endpoint:', error);
  }
}

// Run the test
testAdminEndpoint();