const Challenge = require('../models/Challenge');
const User = require('../models/User');
const CommunityPost = require('../models/CommunityPost');

// Create a new challenge
exports.createChallenge = async (req, res) => {
  try {
    const { title, description, type, theme, genre, startDate, endDate, maxParticipants, prize, rules, tags } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!title || !description || !type || !startDate || !endDate) {
      return res.status(400).json({ message: 'Title, description, type, start date, and end date are required' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    // Get user details
    const user = await User.findById(userId).select('name avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the challenge
    const challenge = new Challenge({
      title: title.trim(),
      description: description.trim(),
      type,
      theme,
      genre,
      startDate: start,
      endDate: end,
      maxParticipants: maxParticipants || 0, // 0 means unlimited
      createdBy: userId,
      createdByName: user.name,
      prize,
      rules: rules || [],
      tags: tags || []
    });

    const savedChallenge = await challenge.save();

    res.status(201).json({
      message: 'Challenge created successfully',
      challenge: {
        id: savedChallenge._id,
        title: savedChallenge.title,
        description: savedChallenge.description,
        type: savedChallenge.type,
        theme: savedChallenge.theme,
        genre: savedChallenge.genre,
        startDate: savedChallenge.startDate,
        endDate: savedChallenge.endDate,
        isActive: savedChallenge.isActive,
        maxParticipants: savedChallenge.maxParticipants,
        participants: savedChallenge.participants,
        winner: savedChallenge.winner,
        createdBy: savedChallenge.createdBy,
        createdByName: savedChallenge.createdByName,
        tags: savedChallenge.tags,
        language: savedChallenge.language,
        prize: savedChallenge.prize,
        rules: savedChallenge.rules,
        createdAt: savedChallenge.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all challenges
exports.getChallenges = async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      sortBy = 'startDate', 
      sortOrder = 'asc', 
      type, 
      genre, 
      isActive, 
      createdBy, 
      tags,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (genre) query.genre = genre;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (createdBy) query.createdBy = createdBy;
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const challenges = await Challenge.find(query)
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('createdBy', 'name avatar role creatorType');

    const total = await Challenge.countDocuments(query);

    res.json({
      challenges: challenges.map(challenge => ({
        id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        theme: challenge.theme,
        genre: challenge.genre,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        isActive: challenge.isActive,
        maxParticipants: challenge.maxParticipants,
        participants: challenge.participants,
        winner: challenge.winner,
        createdBy: challenge.createdBy,
        createdByName: challenge.createdByName,
        tags: challenge.tags,
        language: challenge.language,
        prize: challenge.prize,
        rules: challenge.rules,
        createdAt: challenge.createdAt
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get challenge by ID
exports.getChallengeById = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user ? req.user._id : null;

    const challenge = await Challenge.findById(challengeId)
      .populate('createdBy', 'name avatar role creatorType');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user has participated
    const hasParticipated = userId ? 
      challenge.participants.some(participant => participant.userId.toString() === userId.toString()) : false;

    res.json({
      challenge: {
        id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        theme: challenge.theme,
        genre: challenge.genre,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        isActive: challenge.isActive,
        maxParticipants: challenge.maxParticipants,
        participants: challenge.participants,
        winner: challenge.winner,
        createdBy: challenge.createdBy,
        createdByName: challenge.createdByName,
        tags: challenge.tags,
        language: challenge.language,
        prize: challenge.prize,
        rules: challenge.rules,
        hasParticipated,
        createdAt: challenge.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ message: error.message });
  }
};

// Participate in a challenge
exports.participateInChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const { submission } = req.body;
    const userId = req.user._id;

    // Validate submission URL
    if (!submission) {
      return res.status(400).json({ message: 'Submission URL is required' });
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if challenge is active
    if (!challenge.isActive || new Date() < challenge.startDate || new Date() > challenge.endDate) {
      return res.status(400).json({ message: 'Challenge is not active' });
    }

    // Check if user has already participated
    const hasParticipated = challenge.participants.some(
      participant => participant.userId.toString() === userId.toString()
    );
    if (hasParticipated) {
      return res.status(400).json({ message: 'You have already participated in this challenge' });
    }

    // Check if max participants limit reached
    if (challenge.maxParticipants > 0 && challenge.participants.length >= challenge.maxParticipants) {
      return res.status(400).json({ message: 'Maximum number of participants reached' });
    }

    // Add participant
    challenge.participants.push({
      userId,
      submission,
      submittedAt: new Date()
    });
    await challenge.save();

    res.json({
      message: 'Successfully participated in the challenge',
      participantCount: challenge.participants.length
    });
  } catch (error) {
    console.error('Error participating in challenge:', error);
    res.status(500).json({ message: error.message });
  }
};

// Vote in a challenge
exports.voteInChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const { participantId } = req.body;
    const userId = req.user._id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if user has already voted in this challenge
    const userHasVoted = challenge.participants.some(
      participant => 
        participant.userId.toString() === participantId &&
        participant.votedBy && 
        participant.votedBy.includes(userId)
    );

    if (userHasVoted) {
      return res.status(400).json({ message: 'You have already voted for this participant' });
    }

    // Find the participant
    const participantIndex = challenge.participants.findIndex(
      p => p.userId.toString() === participantId
    );

    if (participantIndex === -1) {
      return res.status(404).json({ message: 'Participant not found in this challenge' });
    }

    // Add vote
    challenge.participants[participantIndex].votes += 1;
    if (!challenge.participants[participantIndex].votedBy) {
      challenge.participants[participantIndex].votedBy = [];
    }
    challenge.participants[participantIndex].votedBy.push(userId);

    await challenge.save();

    res.json({
      message: 'Vote recorded successfully',
      votes: challenge.participants[participantIndex].votes
    });
  } catch (error) {
    console.error('Error voting in challenge:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get challenge participants
exports.getChallengeParticipants = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const { sortBy = 'votes', sortOrder = 'desc' } = req.query;

    const challenge = await Challenge.findById(challengeId)
      .populate('participants.userId', 'name avatar role creatorType');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Sort participants
    let sortedParticipants = [...challenge.participants];
    sortedParticipants.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a[sortBy] - b[sortBy];
      } else {
        return b[sortBy] - a[sortBy];
      }
    });

    res.json({
      participants: sortedParticipants.map(participant => ({
        userId: participant.userId,
        submission: participant.submission,
        submittedAt: participant.submittedAt,
        votes: participant.votes,
        createdAt: participant.submittedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching challenge participants:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get trending challenges
exports.getTrendingChallenges = async (req, res) => {
  try {
    const { period = 'month', limit = 10 } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch(period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    const challenges = await Challenge.find({
      startDate: { $gte: startDate }
    })
    .sort({ participants: -1 }) // Sort by number of participants
    .limit(parseInt(limit))
    .populate('createdBy', 'name avatar role creatorType');

    res.json({
      challenges: challenges.map(challenge => ({
        id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        type: challenge.type,
        theme: challenge.theme,
        genre: challenge.genre,
        startDate: challenge.startDate,
        endDate: challenge.endDate,
        isActive: challenge.isActive,
        maxParticipants: challenge.maxParticipants,
        participants: challenge.participants,
        winner: challenge.winner,
        createdBy: challenge.createdBy,
        createdByName: challenge.createdByName,
        tags: challenge.tags,
        language: challenge.language,
        prize: challenge.prize,
        createdAt: challenge.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching trending challenges:', error);
    res.status(500).json({ message: error.message });
  }
};