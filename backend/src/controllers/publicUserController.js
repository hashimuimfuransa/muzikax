const User = require('../models/User');

// Get all users for chat functionality (accessible to authenticated users)
exports.getUsersForChat = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    const currentUserId = req.user._id;
    const { page = 1, limit = 20, search = '' } = req.query;

    // Build query
    let query = { _id: { $ne: currentUserId } };
    
    // Add search functionality if search term provided
    if (search) {
      const searchRegex = new RegExp(search, 'i'); // Case insensitive search
      query.$or = [
        { name: { $regex: searchRegex } },
        { email: { $regex: searchRegex } }
      ];
    }

    // Get users with pagination
    const users = await User.find(query)
      .select('-password -email -whatsappContact') // Exclude sensitive information
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    // Count total users for pagination info
    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNextPage: parseInt(page) * parseInt(limit) < total,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error in getUsersForChat:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a specific user by ID (accessible to authenticated users)
exports.getUserById = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    const userId = req.params.id;
    
    // Get user by ID excluding sensitive information
    const user = await User.findById(userId).select('-password -email -whatsappContact');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: error.message });
  }
};