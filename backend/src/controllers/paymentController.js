const axios = require('axios');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Track = require('../models/Track');
const User = require('../models/User');
const { isValidObjectId } = require('mongoose');

// PesaPal API Configuration
const PESAPAL_CONFIG = {
  BASE_URL: process.env.PESAPAL_BASE_URL || 'https://cybqa.pesapal.com/pesapalv3',
  CONSUMER_KEY: process.env.PESAPAL_CONSUMER_KEY || '',
  CONSUMER_SECRET: process.env.PESAPAL_CONSUMER_SECRET || '',
  ENVIRONMENT: process.env.PESAPAL_ENVIRONMENT || 'sandbox'
};

// Generate OAuth signature for PesaPal API
const generateOAuthSignature = (method, url, nonce, timestamp) => {
  const signatureBase = `${method}&${encodeURIComponent(url)}&${nonce}&${timestamp}`;
  const signature = crypto
    .createHmac('sha1', PESAPAL_CONFIG.CONSUMER_SECRET)
    .update(signatureBase)
    .digest('base64');
  return signature;
};

// Get PesaPal access token
const getPesaPalAccessToken = async () => {
  try {
    if (!PESAPAL_CONFIG.CONSUMER_KEY || !PESAPAL_CONFIG.CONSUMER_SECRET) {
      throw new Error('PesaPal credentials are not configured. Please set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET in environment variables.');
    }

    console.log('PesaPal Config:', {
      baseUrl: PESAPAL_CONFIG.BASE_URL,
      keyLength: PESAPAL_CONFIG.CONSUMER_KEY?.length,
      secretLength: PESAPAL_CONFIG.CONSUMER_SECRET?.length,
      keyPreview: PESAPAL_CONFIG.CONSUMER_KEY?.substring(0, 10) + '...',
      secretPreview: PESAPAL_CONFIG.CONSUMER_SECRET?.substring(0, 10) + '...'
    });
    
    const response = await axios.post(
      `${PESAPAL_CONFIG.BASE_URL}/api/Auth/RequestToken`,
      {
        consumer_key: PESAPAL_CONFIG.CONSUMER_KEY,
        consumer_secret: PESAPAL_CONFIG.CONSUMER_SECRET
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    console.log('PesaPal token response:', response.data);
    
    if (!response.data.token) {
      throw new Error(`PesaPal API did not return a token. Response: ${JSON.stringify(response.data)}`);
    }
    
    return response.data.token;
  } catch (error) {
    console.error('Error getting PesaPal access token:', error);
    console.error('Full error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    console.error('Request config:', error.config);
    
    // Log the actual response body if it's text
    if (error.response?.data && typeof error.response.data === 'string') {
      console.error('Raw response body:', error.response.data);
    }
    
    console.error('Credentials used:', {
      key: PESAPAL_CONFIG.CONSUMER_KEY,
      secret: PESAPAL_CONFIG.CONSUMER_SECRET
    });
    throw error;
  }
};

// Register IPN (Instant Payment Notification) URL
const registerIPN = async (token) => {
  try {
    if (!token) {
      console.warn('Authentication token is missing. Skipping IPN registration.');
      return { notification_id: null };
    }

    const ipnData = {
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/payments/ipn`,
      ipn_notification_type: 'GET'
    };
    
    const response = await axios.post(
      `${PESAPAL_CONFIG.BASE_URL}/api/URLSetup/RegisterIPN`,
      ipnData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('IPN Registration response:', response.data);
    return response.data;
  } catch (error) {
    console.warn('IPN registration failed (continuing without notification_id):', error.message);
    return { notification_id: null };
  }
};

// Submit order to PesaPal
const submitOrder = async (token, orderData) => {
  try {
    const url = `${PESAPAL_CONFIG.BASE_URL}/api/Transactions/SubmitOrderRequest`;
    console.log('Submitting order to PesaPal:', {
      url,
      orderData
    });
    
    const response = await axios.post(url, orderData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('PesaPal submitOrder response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error submitting order to PesaPal:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    console.error('Message:', error.message);
    if (error.config) {
      console.error('Request URL:', error.config.url);
      console.error('Request method:', error.config.method);
    }
    throw error;
  }
};
// Request to pay endpoint (PesaPal version)
const requestToPay = async (req, res) => {
  try {
    const { trackId, phoneNumber, amount, email } = req.body;
    const buyerId = req.user._id;

    // Validate inputs
    if (!trackId || !amount) {
      return res.status(400).json({ 
        message: 'Track ID and amount are required' 
      });
    }

    if (!isValidObjectId(trackId)) {
      return res.status(400).json({ message: 'Invalid track ID' });
    }

    if (!isValidObjectId(buyerId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Get track details
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }

    if (track.paymentType !== 'paid') {
      return res.status(400).json({ message: 'This track is not for sale' });
    }

    if (track.price !== amount) {
      return res.status(400).json({ message: 'Amount does not match track price' });
    }

    // Get seller details
    const seller = await User.findById(track.creatorId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Get PesaPal access token
    const token = await getPesaPalAccessToken();
    
    // Register IPN and get notification_id (optional)
    const ipnResponse = await registerIPN(token);
    const notificationId = ipnResponse?.ipn_id;

    // Create payment record
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment = new Payment({
      trackId,
      buyerId,
      sellerId: track.creatorId,
      amount,
      buyerPhoneNumber: phoneNumber,
      sellerPhoneNumber: seller.whatsappContact,
      momoReferenceId: orderId,
      status: 'pending',
      paymentMethod: 'pesapal'
    });

    await payment.save();

    // Prepare order data for PesaPal
    const orderData = {
      id: orderId,
      currency: 'RWF', // Rwandan Francs
      amount: amount,
      description: `Payment for beat: ${track.title}`,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-success`,
      billing_address: {
        email_address: email || `${buyerId}@muzikax.com`,
        phone_number: phoneNumber || '',
        country_code: 'RW',
        first_name: 'MuzikaX',
        middle_name: '',
        last_name: 'User',
        line_1: '',
        line_2: '',
        city: '',
        state: '',
        postal_code: '',
        zip_code: ''
      }
    };

    if (notificationId) {
      orderData.notification_id = notificationId;
    }

    // Add preferred payment option for mobile money
    orderData.preferred_payment_option = 'MOBILE_MONEY';

    // Submit order to PesaPal
    const pesapalResponse = await submitOrder(token, orderData);

    if (pesapalResponse.redirect_url) {
      res.status(200).json({
        message: 'Payment request initiated successfully',
        paymentId: payment._id,
        orderId: orderId,
        redirectUrl: pesapalResponse.redirect_url,
        status: 'pending'
      });
    } else {
      payment.status = 'failed';
      payment.failureReason = 'PesaPal API request failed';
      await payment.save();
      
      res.status(500).json({ 
        message: 'Failed to initiate payment request',
        error: pesapalResponse
      });
    }

  } catch (error) {
    console.error('PesaPal request to pay error:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        message: 'PesaPal API error',
        error: error.response.data
      });
    } else {
      res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  }
};

// Handle PesaPal IPN (Instant Payment Notification)
const handleIPN = async (req, res) => {
  try {
    const { OrderTrackingId, OrderMerchantReference, StatusCode } = req.query;
    
    console.log('IPN Notification received:', {
      OrderTrackingId,
      OrderMerchantReference,
      StatusCode
    });

    if (!OrderMerchantReference) {
      console.warn('IPN received without OrderMerchantReference');
      return res.status(400).json({ message: 'OrderMerchantReference is required' });
    }

    // Find payment record
    const payment = await Payment.findOne({ 
      momoReferenceId: OrderMerchantReference 
    });

    if (!payment) {
      console.warn(`Payment record not found for reference: ${OrderMerchantReference}`);
      return res.status(404).json({ message: 'Payment record not found' });
    }

    console.log(`Processing payment status update for order: ${OrderMerchantReference}`);

    // Update payment status based on PesaPal response
    if (StatusCode === 'COMPLETED') {
      payment.status = 'completed';
      payment.completedDate = new Date();
      payment.momoTransactionId = OrderTrackingId;
      console.log(`Payment marked as completed: ${OrderMerchantReference}`);
    } else if (StatusCode === 'FAILED' || StatusCode === 'INVALID') {
      payment.status = 'failed';
      payment.failureReason = `PesaPal payment ${StatusCode.toLowerCase()}`;
      console.log(`Payment marked as failed: ${OrderMerchantReference} - Reason: ${StatusCode}`);
    } else {
      console.log(`Payment status update for unhandled status: ${StatusCode}`);
      payment.status = StatusCode.toLowerCase();
    }

    await payment.save();

    console.log(`Payment saved successfully:`, {
      orderId: payment._id,
      status: payment.status,
      amount: payment.amount
    });

    res.status(200).json({ 
      message: 'IPN received and processed successfully',
      paymentId: payment._id,
      status: payment.status
    });

  } catch (error) {
    console.error('PesaPal IPN error:', error);
    res.status(500).json({ 
      message: 'Internal server error processing IPN',
      error: error.message 
    });
  }
};
// Check payment status (updated for PesaPal)
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Find payment record
    const payment = await Payment.findOne({ 
      momoReferenceId: orderId,
      buyerId: userId 
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // For PesaPal, we rely on IPN notifications
    // But we can also check the current status in our database
    let downloadLink = null;
    if (payment.status === 'completed') {
      const track = await Track.findById(payment.trackId);
      if (track) {
        downloadLink = track.audioURL;
      }
    }

    res.status(200).json({
      status: payment.status,
      orderId: payment.momoReferenceId,
      amount: payment.amount,
      currency: payment.currency,
      downloadLink: downloadLink,
      completedDate: payment.completedDate
    });

  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get user's payment history
const getUserPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 10, page = 1 } = req.query;

    const query = { buyerId: userId };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('trackId', 'title coverURL')
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      payments,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });

  } catch (error) {
    console.error('Get user payments error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get seller's earnings
const getSellerEarnings = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const completedPayments = await Payment.find({ 
      sellerId, 
      status: 'completed' 
    });

    const totalEarnings = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalSales = completedPayments.length;

    res.status(200).json({
      totalEarnings,
      totalSales,
      recentPayments: completedPayments.slice(0, 10)
    });

  } catch (error) {
    console.error('Get seller earnings error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

module.exports = {
  requestToPay,
  checkPaymentStatus,
  getUserPayments,
  getSellerEarnings,
  handleIPN
};