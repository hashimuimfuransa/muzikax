const Circle = require('../models/Circle');
const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');

// Create a new circle
exports.createCircle = async (req, res) => {
  try {
    const { name, description, type, genre, location, isPublic, rules, coverImage, bannerImage, language, tags } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!name || !description || !type) {
      return res.status(400).json({ message: 'Name, description, and type are required' });
    }

    if (name.length > 100 || description.length > 500) {
      return res.status(400).json({ message: 'Name must be less than 100 characters and description less than 500 characters' });
    }

    // Get user details
    const user = await User.findById(userId).select('name avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if circle name already exists
    const existingCircle = await Circle.findOne({ name: name.trim() });
    if (existingCircle) {
      return res.status(400).json({ message: 'A circle with this name already exists' });
    }

    // Create the circle
    const circle = new Circle({
      name: name.trim(),
      description: description.trim(),
      type,
      genre,
      location,
      ownerId: userId,
      ownerName: user.name,
      ownerAvatar: user.avatar || '',
      isPublic: isPublic !== undefined ? isPublic : true,
      rules: rules || [],
      coverImage,
      bannerImage,
      language: language || 'en',
      tags: tags || []
    });

    const savedCircle = await circle.save();

    // Add the creator as the first member
    savedCircle.members.push(userId);
    savedCircle.memberCount = 1;
    await savedCircle.save();

    res.status(201).json({
      message: 'Circle created successfully',
      circle: {
        id: savedCircle._id,
        name: savedCircle.name,
        description: savedCircle.description,
        type: savedCircle.type,
        genre: savedCircle.genre,
        location: savedCircle.location,
        ownerId: savedCircle.ownerId,
        ownerName: savedCircle.ownerName,
        ownerAvatar: savedCircle.ownerAvatar,
        members: savedCircle.members,
        moderators: savedCircle.moderators,
        memberCount: savedCircle.memberCount,
        verified: savedCircle.verified,
        isPublic: savedCircle.isPublic,
        rules: savedCircle.rules,
        coverImage: savedCircle.coverImage,
        bannerImage: savedCircle.bannerImage,
        language: savedCircle.language,
        tags: savedCircle.tags,
        createdAt: savedCircle.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating circle:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all circles with filters
exports.getCircles = async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      sortBy = 'memberCount', 
      sortOrder = 'desc', 
      type, 
      genre, 
      location, 
      isPublic, 
      ownerId, 
      tags,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (genre) query.genre = genre;
    if (location) query.location = location;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (ownerId) query.ownerId = ownerId;
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const circles = await Circle.find(query)
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('ownerId', 'name avatar role creatorType');

    const total = await Circle.countDocuments(query);

    res.json({
      circles: circles.map(circle => ({
        id: circle._id,
        name: circle.name,
        description: circle.description,
        type: circle.type,
        genre: circle.genre,
        location: circle.location,
        ownerId: circle.ownerId,
        ownerName: circle.ownerName,
        ownerAvatar: circle.ownerAvatar,
        memberCount: circle.memberCount,
        verified: circle.verified,
        isPublic: circle.isPublic,
        rules: circle.rules,
        coverImage: circle.coverImage,
        bannerImage: circle.bannerImage,
        language: circle.language,
        tags: circle.tags,
        createdAt: circle.createdAt
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching circles:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get circle by ID
exports.getCircleById = async (req, res) => {
  try {
    const circleId = req.params.id;
    const userId = req.user ? req.user._id : null;

    const circle = await Circle.findById(circleId)
      .populate('ownerId', 'name avatar role creatorType')
      .populate('members', 'name avatar role creatorType')
      .populate('moderators', 'name avatar role creatorType');

    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check if user is a member
    const isMember = userId ? circle.members.some(member => member._id.toString() === userId.toString()) : false;

    res.json({
      circle: {
        id: circle._id,
        name: circle.name,
        description: circle.description,
        type: circle.type,
        genre: circle.genre,
        location: circle.location,
        ownerId: circle.ownerId,
        ownerName: circle.ownerName,
        ownerAvatar: circle.ownerAvatar,
        members: circle.members,
        moderators: circle.moderators,
        posts: circle.posts,
        memberCount: circle.memberCount,
        verified: circle.verified,
        isPublic: circle.isPublic,
        rules: circle.rules,
        coverImage: circle.coverImage,
        bannerImage: circle.bannerImage,
        language: circle.language,
        tags: circle.tags,
        isMember,
        createdAt: circle.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching circle:', error);
    res.status(500).json({ message: error.message });
  }
};

// Join a circle
exports.joinCircle = async (req, res) => {
  try {
    const circleId = req.params.id;
    const userId = req.user._id;

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check if user is already a member
    if (circle.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this circle' });
    }

    // Add user to members
    circle.members.push(userId);
    circle.memberCount += 1;
    await circle.save();

    res.json({
      message: 'Successfully joined the circle',
      memberCount: circle.memberCount
    });
  } catch (error) {
    console.error('Error joining circle:', error);
    res.status(500).json({ message: error.message });
  }
};

// Leave a circle
exports.leaveCircle = async (req, res) => {
  try {
    const circleId = req.params.id;
    const userId = req.user._id;

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check if user is the owner
    if (circle.ownerId.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Circle owner cannot leave the circle' });
    }

    // Check if user is a member
    const isMember = circle.members.includes(userId);
    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this circle' });
    }

    // Remove user from members
    circle.members = circle.members.filter(memberId => memberId.toString() !== userId.toString());
    circle.memberCount = Math.max(0, circle.memberCount - 1);
    await circle.save();

    res.json({
      message: 'Successfully left the circle',
      memberCount: circle.memberCount
    });
  } catch (error) {
    console.error('Error leaving circle:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get circle posts
exports.getCirclePosts = async (req, res) => {
  try {
    const circleId = req.params.id;
    const { limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Check if circle exists
    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const posts = await CommunityPost.find({ circleId })
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('userId', 'name avatar role creatorType');

    const total = await CommunityPost.countDocuments({ circleId });

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        userId: post.userId,
        userName: post.userName,
        userAvatar: post.userAvatar,
        userRole: post.userRole,
        postType: post.postType,
        content: post.content,
        mediaUrl: post.mediaUrl,
        mediaThumbnail: post.mediaThumbnail,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        isPinned: post.isPinned,
        isVerified: post.isVerified,
        language: post.language,
        location: post.location,
        genre: post.genre,
        tags: post.tags,
        relatedTrackId: post.relatedTrackId,
        relatedArtistId: post.relatedArtistId,
        challengeId: post.challengeId,
        pollOptions: post.pollOptions,
        pollEndsAt: post.pollEndsAt,
        createdAt: post.createdAt
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching circle posts:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add moderator to circle
exports.addModeratorToCircle = async (req, res) => {
  try {
    const circleId = req.params.id;
    const { userId: targetUserId } = req.body;
    const currentUserId = req.user._id;

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check if current user is the owner
    if (circle.ownerId.toString() !== currentUserId.toString()) {
      return res.status(401).json({ message: 'Only the circle owner can add moderators' });
    }

    // Check if target user is a member
    if (!circle.members.includes(targetUserId)) {
      return res.status(400).json({ message: 'User must be a member of the circle to become a moderator' });
    }

    // Check if user is already a moderator
    if (circle.moderators.includes(targetUserId)) {
      return res.status(400).json({ message: 'User is already a moderator' });
    }

    // Add user as moderator
    circle.moderators.push(targetUserId);
    await circle.save();

    res.json({
      message: 'User added as moderator successfully'
    });
  } catch (error) {
    console.error('Error adding moderator to circle:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove moderator from circle
exports.removeModeratorFromCircle = async (req, res) => {
  try {
    const circleId = req.params.id;
    const { userId: targetUserId } = req.body;
    const currentUserId = req.user._id;

    const circle = await Circle.findById(circleId);
    if (!circle) {
      return res.status(404).json({ message: 'Circle not found' });
    }

    // Check if current user is the owner
    if (circle.ownerId.toString() !== currentUserId.toString()) {
      return res.status(401).json({ message: 'Only the circle owner can remove moderators' });
    }

    // Check if target user is a moderator
    if (!circle.moderators.includes(targetUserId)) {
      return res.status(400).json({ message: 'User is not a moderator' });
    }

    // Check if trying to remove the owner
    if (circle.ownerId.toString() === targetUserId.toString()) {
      return res.status(400).json({ message: 'Cannot remove the circle owner from moderators' });
    }

    // Remove user from moderators
    circle.moderators = circle.moderators.filter(modId => modId.toString() !== targetUserId.toString());
    await circle.save();

    res.json({
      message: 'User removed from moderators successfully'
    });
  } catch (error) {
    console.error('Error removing moderator from circle:', error);
    res.status(500).json({ message: error.message });
  }
};