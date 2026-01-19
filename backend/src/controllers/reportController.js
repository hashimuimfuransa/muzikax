const Report = require('../models/Report');
const Track = require('../models/Track');
const User = require('../models/User');

// Create a new report
const createReport = async (req, res) => {
  try {
    const { trackId, reason, description } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!trackId || !reason) {
      return res.status(400).json({ message: 'Track ID and reason are required' });
    }

    // Check if track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    // Check if user has already reported this track
    const existingReport = await Report.findOne({
      reporterId: userId,
      trackId: trackId
    });

    if (existingReport) {
      return res.status(400).json({ message: 'You have already reported this track' });
    }

    // Create the report
    const report = await Report.create({
      reporterId: userId,
      trackId: trackId,
      reason,
      description: description || ''
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get reports (admin only)
const getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, reason, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (reason) filter.reason = reason;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Fetch reports with pagination, filtering, and sorting
    const reports = await Report.find(filter)
      .populate('reporterId', 'name email')
      .populate('trackId', 'title creatorId')
      .populate('adminId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Count total reports for pagination
    const total = await Report.countDocuments(filter);

    res.json({
      reports,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single report (admin only)
const getReport = async (req, res) => {
  try {
    const reportId = req.params.id;

    const report = await Report.findById(reportId)
      .populate('reporterId', 'name email')
      .populate('trackId', 'title creatorId')
      .populate('adminId', 'name email');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update report status (admin only)
const updateReportStatus = async (req, res) => {
  try {
    const reportId = req.params.id;
    const { status, adminNotes } = req.body;
    const adminId = req.user._id;

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Update the report
    report.status = status;
    report.adminNotes = adminNotes;
    report.adminId = adminId;
    if (['resolved', 'dismissed'].includes(status)) {
      report.resolvedAt = new Date();
    }

    const updatedReport = await report.save();

    res.json(updatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getReports,
  getReport,
  updateReportStatus
};