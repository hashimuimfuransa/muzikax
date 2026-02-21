const Withdrawal = require('../models/Withdrawal');
const Payment = require('../models/Payment');
const User = require('../models/User');
const { isValidObjectId } = require('mongoose');

// Artist: Request a withdrawal
const requestWithdrawal = async (req, res) => {
  try {
    const { amount, mobileNumber } = req.body;
    const artistId = req.user._id;

    // Validate inputs
    if (!amount || !mobileNumber) {
      return res.status(400).json({
        message: 'Amount and mobile number are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: 'Amount must be greater than 0'
      });
    }

    // Get artist's total earnings
    const completedPayments = await Payment.find({
      sellerId: artistId,
      status: 'completed'
    });

    const totalEarnings = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate already withdrawn amount
    const approvedWithdrawals = await Withdrawal.find({
      artistId,
      status: { $in: ['approved', 'paid'] }
    });

    const totalWithdrawn = approvedWithdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
    const availableBalance = totalEarnings - totalWithdrawn;

    // Check if artist has sufficient balance
    if (amount > availableBalance) {
      return res.status(400).json({
        message: 'Insufficient balance',
        availableBalance,
        totalEarnings,
        totalWithdrawn
      });
    }

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      artistId,
      amount,
      mobileNumber,
      status: 'pending'
    });

    await withdrawal.save();

    res.status(201).json({
      message: 'Withdrawal request submitted successfully',
      withdrawal,
      availableBalance: availableBalance - amount
    });

  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Artist: Get their earnings and withdrawal history
const getArtistEarnings = async (req, res) => {
  try {
    const artistId = req.user._id;

    // Get all completed payments for the artist
    const completedPayments = await Payment.find({
      sellerId: artistId,
      status: 'completed'
    }).populate('trackId', 'title coverURL')
      .populate('buyerId', 'name email')
      .sort({ completedDate: -1 });

    const totalEarnings = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Get withdrawal history
    const withdrawals = await Withdrawal.find({ artistId })
      .sort({ requestDate: -1 });

    const totalWithdrawn = withdrawals
      .filter(w => w.status === 'paid' || w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);

    const availableBalance = totalEarnings - totalWithdrawn;

    // Get pending withdrawal requests
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

    res.status(200).json({
      earnings: {
        totalEarnings,
        totalWithdrawn,
        availableBalance,
        completedTransactions: completedPayments.length
      },
      recentTransactions: completedPayments.slice(0, 10),
      withdrawalHistory: withdrawals,
      pendingWithdrawals
    });

  } catch (error) {
    console.error('Get artist earnings error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get all withdrawal requests with filters
const getAllWithdrawals = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .populate('artistId', 'name email whatsappContact')
      .populate('approvedBy', 'name email')
      .sort({ requestDate: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Withdrawal.countDocuments(query);

    // Calculate summary
    const allWithdrawals = await Withdrawal.find(query);
    const summary = {
      totalRequested: allWithdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0),
      totalApproved: allWithdrawals.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0),
      totalPaid: allWithdrawals.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.amount, 0),
      totalRejected: allWithdrawals.filter(w => w.status === 'rejected').reduce((sum, w) => sum + w.amount, 0)
    };

    res.status(200).json({
      withdrawals,
      summary,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });

  } catch (error) {
    console.error('Get all withdrawals error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Approve a withdrawal request
const approveWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { notes } = req.body;
    const adminId = req.user._id;

    if (!isValidObjectId(withdrawalId)) {
      return res.status(400).json({ message: 'Invalid withdrawal ID' });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        message: `Cannot approve withdrawal with status: ${withdrawal.status}`
      });
    }

    // Update withdrawal
    withdrawal.status = 'approved';
    withdrawal.approvalDate = new Date();
    withdrawal.approvedBy = adminId;
    if (notes) {
      withdrawal.notes = notes;
    }

    await withdrawal.save();

    res.status(200).json({
      message: 'Withdrawal approved successfully',
      withdrawal
    });

  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Reject a withdrawal request
const rejectWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { rejectReason } = req.body;
    const adminId = req.user._id;

    if (!isValidObjectId(withdrawalId)) {
      return res.status(400).json({ message: 'Invalid withdrawal ID' });
    }

    if (!rejectReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        message: `Cannot reject withdrawal with status: ${withdrawal.status}`
      });
    }

    // Update withdrawal
    withdrawal.status = 'rejected';
    withdrawal.approvalDate = new Date();
    withdrawal.approvedBy = adminId;
    withdrawal.rejectReason = rejectReason;

    await withdrawal.save();

    res.status(200).json({
      message: 'Withdrawal rejected successfully',
      withdrawal
    });

  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Mark withdrawal as paid
const markWithdrawalAsPaid = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { transactionReference } = req.body;

    if (!isValidObjectId(withdrawalId)) {
      return res.status(400).json({ message: 'Invalid withdrawal ID' });
    }

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'approved') {
      return res.status(400).json({
        message: `Can only mark approved withdrawals as paid. Current status: ${withdrawal.status}`
      });
    }

    // Update withdrawal
    withdrawal.status = 'paid';
    withdrawal.paymentDate = new Date();
    if (transactionReference) {
      withdrawal.transactionReference = transactionReference;
    }

    await withdrawal.save();

    res.status(200).json({
      message: 'Withdrawal marked as paid successfully',
      withdrawal
    });

  } catch (error) {
    console.error('Mark withdrawal as paid error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin: Get earnings dashboard (total from all artists)
const getEarningsDashboard = async (req, res) => {
  try {
    // Get all completed payments
    const allPayments = await Payment.find({ status: 'completed' });
    const totalPlatformEarnings = allPayments.reduce((sum, p) => sum + p.amount, 0);

    // Get total by artist
    const artistEarnings = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: {
        _id: '$sellerId',
        totalEarnings: { $sum: '$amount' },
        totalSales: { $sum: 1 }
      }},
      { $sort: { totalEarnings: -1 } }
    ]);

    // Populate artist names
    const artistEarningsWithNames = await Promise.all(
      artistEarnings.map(async (earning) => {
        const artist = await User.findById(earning._id).select('name email whatsappContact');
        return {
          artist,
          totalEarnings: earning.totalEarnings,
          totalSales: earning.totalSales
        };
      })
    );

    // Get withdrawal statistics
    const allWithdrawals = await Withdrawal.find();
    const totalWithdrawnByPlatform = allWithdrawals
      .filter(w => w.status === 'paid')
      .reduce((sum, w) => sum + w.amount, 0);

    const totalApprovedWithdrawals = allWithdrawals
      .filter(w => w.status === 'approved')
      .reduce((sum, w) => sum + w.amount, 0);

    const totalPendingWithdrawals = allWithdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);

    // Calculate remaining balance
    const remainingBalance = totalPlatformEarnings - totalWithdrawnByPlatform - totalApprovedWithdrawals;

    // Get top artists
    const topArtists = artistEarningsWithNames.slice(0, 10);

    res.status(200).json({
      summary: {
        totalPlatformEarnings,
        totalWithdrawn: totalWithdrawnByPlatform,
        totalApprovedPending: totalApprovedWithdrawals,
        totalPendingRequests: totalPendingWithdrawals,
        remainingBalance,
        totalArtists: artistEarnings.length,
        totalTransactions: allPayments.length
      },
      topArtists,
      allArtistEarnings: artistEarningsWithNames,
      withdrawalStats: {
        totalRequests: allWithdrawals.length,
        pending: allWithdrawals.filter(w => w.status === 'pending').length,
        approved: allWithdrawals.filter(w => w.status === 'approved').length,
        paid: allWithdrawals.filter(w => w.status === 'paid').length,
        rejected: allWithdrawals.filter(w => w.status === 'rejected').length
      }
    });

  } catch (error) {
    console.error('Get earnings dashboard error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  requestWithdrawal,
  getArtistEarnings,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalAsPaid,
  getEarningsDashboard
};
