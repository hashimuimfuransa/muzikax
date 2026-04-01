"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = require("bcryptjs");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const OTP = require("../models/OTP");
const crypto = require('crypto');
const emailService_1 = require("../services/emailService");
// Register user
const register = async (req, res) => {
    try {
        const { name, email, password, role, creatorType } = req.body;
        // Check if user exists
        const userExists = await User_1.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Hash password
        const salt = await bcryptjs_1.genSalt(10);
        const hashedPassword = await bcryptjs_1.hash(password, salt);
        // Create user
        const user = await User_1.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'fan',
            creatorType: role === 'creator' ? creatorType : null
        });
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        
        // Send welcome email to new user
        try {
            const emailService = require('../services/emailService');
            const welcomeHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF4D67 0%, #FFCB2B 100%); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to MuzikaX! 🎵</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
              <p style="font-size: 18px; color: #333;">Dear ${name},</p>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6;">
                We're thrilled to have you join the MuzikaX community! You've just taken the first step into a world of African music and digital creativity.
              </p>
              
              <div style="background-color: white; padding: 25px; border-radius: 10px; margin: 25px 0;">
                <h2 style="color: #FF4D67; font-size: 20px; margin-top: 0;">🎉 What's Next?</h2>
                <ul style="font-size: 16px; color: #555; line-height: 2; padding-left: 20px;">
                  <li><strong>Complete Your Profile:</strong> Add your photo, bio, and social links</li>
                  <li><strong>Explore Music:</strong> Discover trending tracks, artists, and albums</li>
                  <li><strong>Connect:</strong> Follow your favorite artists and creators</li>
                  <li><strong>Share:</strong> Upload your own tracks, beats, or mixes</li>
                  <li><strong>Engage:</strong> Like, comment, and share with the community</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                   style="background: linear-gradient(135deg, #FF4D67 0%, #FFCB2B 100%); 
                          color: white; 
                          padding: 15px 40px; 
                          text-decoration: none; 
                          border-radius: 30px; 
                          font-size: 16px; 
                          font-weight: bold;
                          display: inline-block;">
                  Start Exploring →
                </a>
              </div>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6;">
                Whether you're here to listen, create, or both, MuzikaX is your platform to shine. Join thousands of other music lovers and creators from Rwanda and across Africa.
              </p>
              
              <p style="font-size: 16px; color: #555;">
                Need help? Our support team is always here for you.
              </p>
              
              <p style="font-size: 16px; color: #555;">
                Welcome aboard!<br>
                <strong style="color: #FF4D67;">The MuzikaX Team</strong>
              </p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center; color: #999; font-size: 14px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
              <p style="margin: 10px 0 0 0;">Rwanda & African Artists Music Platform</p>
              <p style="margin: 10px 0 0 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="color: #FFCB2B; text-decoration: none;">Visit Website</a> | 
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/contact" style="color: #FFCB2B; text-decoration: none;">Contact Support</a>
              </p>
            </div>
          </div>
        `;
            
            await emailService.sendEmail({
                to: email,
                subject: 'Welcome to MuzikaX - Your Musical Journey Begins! 🎵',
                html: welcomeHtml
            });
            
            console.log(`✅ Welcome email sent to ${email}`);
        }
        catch (emailError) {
            console.error('❌ Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
        }
        
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            creatorType: user.creatorType,
            avatar: user.avatar,
            bio: user.bio,
            followersCount: user.followersCount,
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await User_1.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Check password
        const isMatch = await bcryptjs_1.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Check if user is an artist or admin - requires 2FA
        if ((user.role === 'creator' && user.creatorType === 'artist') || user.role === 'admin') {
            // For artists and admins, don't complete login yet - send OTP first
            const otpRecord = await OTP.createOTP({
                email: user.email,
                purpose: 'login',
                expiresInMinutes: 10
            });
            
            // Send OTP via email
            const emailResult = await (0, emailService_1.sendOTPEmail)(user.email, otpRecord.otp, user.name);
            
            if (!emailResult.success) {
                console.error('Failed to send OTP email:', emailResult);
                return res.status(500).json({ 
                    message: 'Failed to send verification code. Please try again.',
                    error: emailResult.error
                });
            }
            
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                creatorType: user.creatorType,
                requires2FA: true,
                message: 'OTP sent to your email. Please verify to complete login.',
                nextStep: 'verify-otp',
                expiresInSeconds: 600
            });
            return;
        }
        // For non-artists, complete login normally
        const accessToken = (0, jwt_1.generateAccessToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            creatorType: user.creatorType,
            avatar: user.avatar,
            bio: user.bio,
            followersCount: user.followersCount,
            accessToken,
            refreshToken,
            requires2FA: false
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.login = login;
// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ message: 'No refresh token provided' });
            return;
        }
        // Verify refresh token using our utility function
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (!decoded) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        const user = await User_1.findById(decoded.id);
        if (!user) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        // Check if user is an artist or admin who needs 2FA
        if ((user.role === 'creator' && user.creatorType === 'artist') || user.role === 'admin') {
            res.status(403).json({ 
                message: 'This account requires 2FA verification. Please login again.',
                requiresRelogin: true
            });
            return;
        }
        // Generate new tokens
        const newAccessToken = (0, jwt_1.generateAccessToken)(user);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user);
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};
exports.refreshToken = refreshToken;
// Get user profile
const getUserProfile = async (req, res) => {
    try {
        // Get user without sensitive fields
        const user = await User_1.findById(req.user._id).select('-favorites -playlists -recentlyPlayed -password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Calculate following count from the following array
        const followingCount = user.following ? user.following.length : 0;
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            creatorType: user.creatorType,
            avatar: user.avatar,
            bio: user.bio,
            genres: user.genres,
            following: user.following || [], // Add following array
            followersCount: user.followersCount,
            followingCount: followingCount, // Add following count
            socials: user.socials,
            whatsappContact: user.whatsappContact,
            createdAt: user.createdAt
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserProfile = getUserProfile;
// Request password reset
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Find user
        const user = await User_1.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not for security
            res.json({ message: 'If that email exists in our system, you will receive a password reset link shortly' });
            return;
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        // Save hashed token to user
        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        // Send reset email
        const emailService = require('../services/emailService');
        const resetHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF4D67 0%, #FFCB2B 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password 🔐</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
              <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6;">
                We received a request to reset your password for your MuzikaX account. Click the button below to reset it:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: linear-gradient(135deg, #FF4D67 0%, #FFCB2B 100%); 
                          color: white; 
                          padding: 15px 40px; 
                          text-decoration: none; 
                          border-radius: 30px; 
                          font-size: 16px; 
                          font-weight: bold;
                          display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666; line-height: 1.6;">
                Or copy and paste this link into your browser:
                <br>
                <a href="${resetUrl}" style="color: #FF4D67; word-break: break-all;">${resetUrl}</a>
              </p>
              
              <p style="font-size: 14px; color: #666; line-height: 1.6; margin-top: 20px;">
                This link will expire in <strong>1 hour</strong>.
              </p>
              
              <p style="font-size: 14px; color: #666; line-height: 1.6;">
                If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.
              </p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center; color: #999; font-size: 14px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
              <p style="margin: 10px 0 0 0;">Rwanda & African Artists Music Platform</p>
            </div>
          </div>
        `;

        await emailService.sendEmail({
            to: email,
            subject: 'MuzikaX Password Reset Request',
            html: resetHtml
        });

        console.log(`✅ Password reset email sent to ${email}`);
        res.json({ message: 'If that email exists in our system, you will receive a password reset link shortly' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Reset password with token
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            res.status(400).json({ message: 'Token and new password are required' });
            return;
        }

        // Validate password
        if (newPassword.length < 8) {
            res.status(400).json({ message: 'Password must be at least 8 characters long' });
            return;
        }

        // Hash the token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid reset token
        const user = await User_1.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            res.status(400).json({ message: 'Invalid or expired reset token' });
            return;
        }

        // Hash new password
        const salt = await bcryptjs_1.genSalt(10);
        const hashedPassword = await bcryptjs_1.hash(newPassword, salt);

        // Update password and clear reset tokens
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Send confirmation email
        const emailService = require('../services/emailService');
        const confirmHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Successful ✓</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
              <p style="font-size: 16px; color: #333;">Hello ${user.name},</p>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6;">
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6;">
                If you didn't make this change, please contact our support team immediately.
              </p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center; color: #999; font-size: 14px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
            </div>
          </div>
        `;

        await emailService.sendEmail({
            to: user.email,
            subject: 'Password Reset Successful',
            html: confirmHtml
        });

        res.json({ message: 'Password reset successful. You can now log in with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.requestPasswordReset = requestPasswordReset;
exports.resetPassword = resetPassword;

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User_1.findById(req.user._id).select('+password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { name, bio, socials, avatar } = req.body;
        user.name = name || user.name;
        user.bio = bio || user.bio;
        user.avatar = avatar || user.avatar;
        user.socials = socials || user.socials;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            creatorType: updatedUser.creatorType,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            followersCount: updatedUser.followersCount,
            socials: updatedUser.socials,
            createdAt: updatedUser.createdAt
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateUserProfile = updateUserProfile;
//# sourceMappingURL=authController.js.map