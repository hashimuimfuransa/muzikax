const Event = require('../models/Event');

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    // Get events that are happening in the future, sorted by date
    const events = await Event.find({ date: { $gte: new Date() } })
      .sort({ date: 1 })
      .populate('creator', 'name');
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, image, attendees } = req.body;
    
    // Validate required fields
    if (!title || !description || !date || !location || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Create new event
    const event = new Event({
      title,
      description,
      date: new Date(date),
      location,
      image,
      attendees: attendees || 0,
      creator: req.user._id
    });
    
    const savedEvent = await event.save();
    
    // Populate creator info
    await savedEvent.populate('creator', 'name');
    
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUpcomingEvents,
  createEvent
};