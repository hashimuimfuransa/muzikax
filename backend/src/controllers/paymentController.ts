import { Request, Response } from 'express';
import axios from 'axios';
import Payment from '../models/Payment';
import Track from '../models/Track';
import User from '../models/User';
import { isValidObjectId } from 'mongoose';

// MTN MoMo API Configuration
const MOMO_CONFIG = {
  BASE_URL: process.env.MOMO_BASE_URL || 'https://proxy.momoapi.mtn.com',
  API_KEY: process.env.MOMO_API_KEY || '',
  SUBSCRIPTION_KEY: process.env.MOMO_SUBSCRIPTION_KEY || '',
  COLLECTION_PRIMARY_KEY: process.env.MOMO_COLLECTION_PRIMARY_KEY || '',
  COLLECTION_SECONDARY_KEY: process.env.MOMO_COLLECTION_SECONDARY_KEY || '',
  ENVIRONMENT: process.env.MOMO_ENVIRONMENT || 'sandbox' // sandbox or production
};

// Generate UUID for transaction reference
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Request to pay endpoint
export const requestToPay = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trackId, phoneNumber, amount } = req.body;
    const buyerId = (req as any).user._id;

    // Validate inputs
    if (!trackId || !phoneNumber || !amount) {
      res.status(400).json({ 
        message: 'Track ID, phone number, and amount are required' 
      });
      return;
    }

    if (!isValidObjectId(trackId)) {
      res.status(400).json({ message: 'Invalid track ID' });
      return;
    }

    if (!isValidObjectId(buyerId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    // Get track details
    const track = await Track.findById(trackId);
    if (!track) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    if (track.paymentType !== 'paid') {
      res.status(400).json({ message: 'This track is not for sale' });
      return;
    }

    if (track.price !== amount) {
      res.status(400).json({ message: 'Amount does not match track price' });
      return;
    }

    // Get seller details
    const seller = await User.findById(track.creatorId);
    if (!seller) {
      res.status(404).json({ message: 'Seller not found' });
      return;
    }

    // Create payment record
    const referenceId = generateUUID();
    const payment = new Payment({
      trackId,
      buyerId,
      sellerId: track.creatorId,
      amount,
      buyerPhoneNumber: phoneNumber,
      sellerPhoneNumber: seller.whatsappContact,
      momoReferenceId: referenceId,
      status: 'pending'
    });

    await payment.save();

    // MTN MoMo API request
    const momoResponse = await axios.post(
      `${MOMO_CONFIG.BASE_URL}/collection/v1_0/requesttopay`,
      {
        amount: amount.toString(),
        currency: 'RWF',
        externalId: referenceId,
        payer: {
          partyIdType: 'MSISDN',
          partyId: phoneNumber
        },
        payerMessage: `Payment for beat: ${track.title}`,
        payeeNote: `Purchase of ${track.title} from ${seller.name}`
      },
      {
        headers: {
          'Authorization': `Bearer ${MOMO_CONFIG.COLLECTION_PRIMARY_KEY}`,
          'X-Reference-Id': referenceId,
          'X-Target-Environment': MOMO_CONFIG.ENVIRONMENT,
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.SUBSCRIPTION_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    if (momoResponse.status === 202) {
      res.status(200).json({
        message: 'Payment request initiated successfully',
        paymentId: payment._id,
        referenceId: referenceId,
        status: 'pending'
      });
    } else {
      payment.status = 'failed';
      payment.failureReason = 'MTN MoMo API request failed';
      await payment.save();
      
      res.status(500).json({ 
        message: 'Failed to initiate payment request',
        error: momoResponse.data
      });
    }

  } catch (error: any) {
    console.error('MTN MoMo request to pay error:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        message: 'MTN MoMo API error',
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

// Check payment status
export const checkPaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { referenceId } = req.params;
    const userId = (req as any).user._id;

    if (!referenceId) {
      res.status(400).json({ message: 'Reference ID is required' });
      return;
    }

    // Find payment record
    const payment = await Payment.findOne({ 
      momoReferenceId: referenceId,
      buyerId: userId 
    });

    if (!payment) {
      res.status(404).json({ message: 'Payment record not found' });
      return;
    }

    // Check MTN MoMo transaction status
    const statusResponse = await axios.get(
      `${MOMO_CONFIG.BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          'Authorization': `Bearer ${MOMO_CONFIG.COLLECTION_PRIMARY_KEY}`,
          'X-Target-Environment': MOMO_CONFIG.ENVIRONMENT,
          'Ocp-Apim-Subscription-Key': MOMO_CONFIG.SUBSCRIPTION_KEY
        }
      }
    );

    const momoStatus = statusResponse.data.status;
    
    // Update payment status based on MTN response
    if (momoStatus === 'SUCCESSFUL') {
      payment.status = 'completed';
      payment.completedDate = new Date();
      payment.momoTransactionId = statusResponse.data.financialTransactionId;
    } else if (momoStatus === 'FAILED' || momoStatus === 'REJECTED') {
      payment.status = 'failed';
      payment.failureReason = statusResponse.data.reason || momoStatus;
    }

    await payment.save();

    // If payment completed, provide download link
    let downloadLink = null;
    if (payment.status === 'completed') {
      const track = await Track.findById(payment.trackId);
      if (track) {
        downloadLink = track.audioURL;
      }
    }

    res.status(200).json({
      status: payment.status,
      referenceId: payment.momoReferenceId,
      amount: payment.amount,
      currency: payment.currency,
      downloadLink: downloadLink,
      completedDate: payment.completedDate
    });

  } catch (error: any) {
    console.error('Check payment status error:', error);
    
    if (error.response) {
      res.status(error.response.status).json({
        message: 'MTN MoMo API error',
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

// Get user's payment history
export const getUserPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { status, limit = 10, page = 1 } = req.query;

    const query: any = { buyerId: userId };
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

  } catch (error: any) {
    console.error('Get user payments error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// Get seller's earnings
export const getSellerEarnings = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = (req as any).user._id;

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

  } catch (error: any) {
    console.error('Get seller earnings error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};