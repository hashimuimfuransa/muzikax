import { Request, Response } from 'express';
import User from '../models/User';
import { isValidObjectId } from 'mongoose';

// Update user's WhatsApp contact
export const updateWhatsAppContact = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;
    
    // Validate user ID
    if (!isValidObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await User.findById(userId).select('+password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { whatsappContact } = req.body;

    // Validate input data
    if (whatsappContact !== undefined && typeof whatsappContact !== 'string') {
      res.status(400).json({ message: 'WhatsApp contact must be a string' });
      return;
    }

    // Update WhatsApp contact field only if provided
    if (whatsappContact !== undefined) {
      user.whatsappContact = whatsappContact;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      creatorType: updatedUser.creatorType,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      genres: updatedUser.genres,
      followersCount: updatedUser.followersCount,
      socials: updatedUser.socials,
      whatsappContact: updatedUser.whatsappContact,
      createdAt: updatedUser.createdAt
    });
  } catch (error: any) {
    console.error('WhatsApp contact update error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email is already in use by another account' });
      return;
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ message: messages.join(', ') });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error during WhatsApp contact update' });
  }
};

// Get user's WhatsApp contact
export const getWhatsAppContact = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;
    
    // Validate user ID
    if (!isValidObjectId(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      whatsappContact: user.whatsappContact || ''
    });
  } catch (error: any) {
    console.error('Error fetching WhatsApp contact:', error);
    res.status(500).json({ message: error.message || 'Server error fetching WhatsApp contact' });
  }
};