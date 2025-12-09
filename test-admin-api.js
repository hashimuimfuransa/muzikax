const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test credentials
const ADMIN_EMAIL = 'admin@muzikax.com';
const ADMIN_PASSWORD = 'admin123';

// JWT secrets (should match your .env)
const JWT_ACCESS_SECRET = 'access_secret_key';

async function createTestAdmin() {
  try {
    // Import User model dynamically
    const { default: User } = await import('./backend/src/models/User.js');
    
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
    // Create or get admin user
    const adminUser = await createTestAdmin();
    if (!adminUser) {
      console.log('Failed to create/get admin user');
      return;
    }

    // Generate token
    const token = generateTestToken(adminUser);
    console.log('Generated token:', token);

    // Test the admin analytics endpoint
    const response = await fetch('http://localhost:5000/api/admin/analytics', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Admin analytics data:', data);
    } else {
      console.error('Failed to fetch admin analytics:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error testing admin endpoint:', error);
  }
}

// Run the test
testAdminEndpoint();