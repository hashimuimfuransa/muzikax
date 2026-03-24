# Email Notifications & Two-Factor Authentication Implementation

## Overview
This document describes the complete implementation of automatic email notifications and two-factor authentication (2FA) for MuzikaX using SendGrid API.

---

## 📧 Email Notifications System

### Features Implemented

1. **New Track Notifications** - Sent to followers when an artist they follow releases a new track
2. **New Playlist Notifications** - Curated playlist recommendations
3. **Trending of the Week** - Weekly digest of top trending tracks (every Monday at 9 AM UTC)
4. **Recommended Artists** - Bi-weekly artist recommendations (every Wednesday at 10 AM UTC)

### Architecture

#### Backend Components

1. **Email Service** (`backend/src/services/emailService.js`)
   - SendGrid integration
   - HTML email templates with beautiful designs
   - Rate limiting to prevent spam
   - Plain text fallbacks

2. **Notification Email Controller** (`backend/src/controllers/notificationEmailController.js`)
   - `sendNewTrackEmailToFollowers()` - Sends emails to artist's followers
   - `sendNewPlaylistEmail()` - Sends playlist recommendations
   - `sendWeeklyTrendingEmail()` - Weekly trending digest
   - `sendRecommendedArtistsEmail()` - Artist recommendations
   - `notifyNewTrackUpload()` - Triggered on track upload

3. **Scheduled Jobs** (`backend/src/jobs/scheduledEmailJobs.js`)
   - Cron job scheduler using `node-cron`
   - Weekly trending emails: Every Monday at 9:00 AM UTC
   - Recommended artists: Every Wednesday at 10:00 AM UTC
   - OTP cleanup: Every hour

4. **User Model Updates** (`backend/src/models/User.js`)
   ```javascript
   // New fields added:
   - is2FAEnabled: Boolean
   - twoFactorSecret: String
   - emailNotifications: {
       newTrackFromFollowing: Boolean,
       newPlaylist: Boolean,
       trendingOfWeek: Boolean,
       recommendedArtists: Boolean,
       accountUpdates: Boolean
     }
   - lastEmailSent: {
       newTrack: Date,
       playlist: Date,
       trending: Date,
       recommendations: Date
     }
   ```

5. **OTP Model** (`backend/src/models/OTP.js`)
   - Secure OTP generation
   - Time-based expiration (10 minutes default)
   - Attempt limiting (max 3 attempts)
   - Auto-cleanup of expired OTPs

### Email Templates

All emails feature:
- Beautiful gradient headers
- Responsive design
- Click-through links
- Professional branding
- Unsubscribe information

### Rate Limiting

To prevent email spam:
- New track emails: Max 1 per hour per user
- Playlist emails: Max 1 per 2 hours per user
- Trending emails: Max 1 per week per user
- Recommendations: Max 1 per 2 weeks per user

---

## 🔐 Two-Factor Authentication (2FA) for Artists

### How It Works

1. **Artist Login Flow**:
   ```
   1. Artist enters email and password
   2. System sends OTP to artist's email via SendGrid
   3. Artist enters OTP
   4. System verifies OTP and completes login
   ```

2. **Endpoints**:
   - `POST /api/auth/2fa/request` - Request OTP
   - `POST /api/auth/2fa/verify` - Verify OTP and login
   - `POST /api/auth/2fa/resend` - Resend OTP
   - `PUT /api/auth/2fa/enable` - Enable/disable 2FA
   - `GET /api/auth/2fa/status` - Get 2FA status

3. **Security Features**:
   - 6-digit random OTP
   - 10-minute expiration
   - Maximum 3 verification attempts
   - Auto-deletion of used/expired OTPs
   - Mandatory for all artist accounts

### Files Created

1. **Two-Factor Auth Controller** (`backend/src/controllers/twoFAController.js`)
   - `requestOTP()` - Generate and send OTP
   - `verifyOTPAndLogin()` - Verify OTP and return tokens
   - `resendOTP()` - Resend verification code
   - `enable2FA()` - Toggle 2FA setting
   - `get2FAStatus()` - Check 2FA status

2. **Auth Routes Updated** (`backend/src/routes/authRoutes.ts`)
   - Added all 2FA endpoints
   - Protected routes with authentication middleware

---

## 🎛️ Frontend Integration

### Notification Settings Page
Location: `frontend/src/app/settings/notifications/page.tsx`

Features:
- Toggle switches for each notification type
- Real-time preference updates
- Beautiful UI with animations
- Toast notifications for feedback
- Mobile responsive

### User Interface Elements

```typescript
interface NotificationPreferences {
  newTrackFromFollowing: boolean;
  newPlaylist: boolean;
  trendingOfWeek: boolean;
  recommendedArtists: boolean;
  accountUpdates: boolean;
}
```

---

## 📦 Dependencies

### Backend
```json
{
  "@sendgrid/mail": "^8.1.0",
  "node-cron": "^3.0.3"
}
```

### Environment Variables (.env)
```env
# SendGrid Email Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@muzikax.com
SENDGRID_FROM_NAME=MuzikaX
```

---

## 🚀 Setup Instructions

### 1. Get SendGrid API Key

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Navigate to Settings → API Keys
3. Create API Key with "Full Access" or "Restricted Access" for Mail Send
4. Copy the API key to your `.env` file

### 2. Update Sender Identity

In SendGrid dashboard:
1. Go to Settings → Sender Authentication
2. Verify your domain or use single sender verification
3. Update `SENDGRID_FROM_EMAIL` in `.env`

### 3. Install Dependencies

```bash
cd backend
npm install
```

### 4. Run the Server

```bash
npm run dev
```

The scheduled jobs will automatically initialize on server start.

---

## 📊 Testing

### Manual Testing

Test scripts can be created to manually trigger emails:

```javascript
// In backend directory
const { manualTriggerWeeklyTrending } = require('./src/jobs/scheduledEmailJobs');

manualTriggerWeeklyTrending();
```

### 2FA Testing Flow

1. **Request OTP**:
```javascript
POST http://localhost:5000/api/auth/2fa/request
Content-Type: application/json
{
  "email": "artist@example.com"
}
```

2. **Verify OTP**:
```javascript
POST http://localhost:5000/api/auth/2fa/verify
Content-Type: application/json
{
  "email": "artist@example.com",
  "otp": "123456",
  "password": "yourpassword"
}
```

---

## 🔄 Automatic Triggers

### Track Upload
When an artist uploads a track:
1. Track is saved to database
2. `notifyNewTrackUpload()` is called (non-blocking)
3. Emails are sent to followers (with rate limiting)

### Scheduled Jobs
- **Monday 9 AM UTC**: Weekly trending emails
- **Wednesday 10 AM UTC**: Artist recommendations
- **Every hour**: Cleanup expired OTPs

---

## 📈 Monitoring & Logging

All email operations are logged:
- Successful sends
- Failed sends with error details
- Rate limit hits
- OTP generation and verification

Example logs:
```
✅ Email sent to user@example.com: New Track from Artist
📅 Starting weekly trending email job...
✅ Completed weekly trending email job. Sent to 150 users.
🧹 Cleaned up 45 expired OTPs
```

---

## 🛡️ Security Considerations

### OTP Security
- Cryptographically secure random generation
- Single-use only
- Time-limited (10 minutes)
- Attempt limiting (max 3 tries)
- Auto-deletion after use or expiration

### Email Security
- SendGrid API key stored in environment variables
- No sensitive data in email content
- Unsubscribe links included
- SPF/DKIM configuration recommended

### User Privacy
- Users can opt-out of non-essential emails
- Account update emails always sent (critical)
- Last email sent tracking prevents spam
- Respect user, GDPR compliance ready

---

## 🎨 Email Design Features

### Visual Elements
- Gradient headers matching brand colors (#FF4D67, #667eea)
- Responsive layouts
- Cover art images for tracks
- Artist avatars
- Call-to-action buttons
- Social proof (play counts, etc.)

### Content Strategy
- Personalized greetings
- Clear value proposition
- Concise messaging
- Strong CTAs
- Brand consistency

---

## 📱 Frontend Routes

After deployment, users can access:

- **Notification Settings**: `/settings/notifications`
- **2FA Login**: Integrated into existing login flow for artists

---

## 🔧 Future Enhancements

Potential improvements:

1. **Email Analytics**
   - Open rate tracking
   - Click-through rates
   - A/B testing subject lines

2. **Advanced Segmentation**
   - Genre-specific recommendations
   - Geographic targeting
   - Activity-based triggers

3. **Preference Center**
   - Email frequency options
   - Genre preferences
   - Artist-specific notifications

4. **2FA Enhancements**
   - SMS OTP option
   - Authenticator app support (TOTP)
   - Backup codes
   - Remember device feature

---

## 🐛 Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SendGrid API key is valid
   - Verify sender identity in SendGrid
   - Check firewall/network issues
   - Review SendGrid dashboard for errors

2. **OTP not received**
   - Check spam folder
   - Verify email address is correct
   - Check SendGrid activity logs
   - Ensure rate limiting isn't blocking

3. **Cron jobs not running**
   - Check server is running continuously
   - Verify timezone settings
   - Check server logs for initialization

---

## 📞 Support

For issues or questions:
- Check SendGrid documentation: https://docs.sendgrid.com/
- Review node-cron documentation: https://github.com/node-cron/node-cron
- Contact MuzikaX development team

---

## ✅ Implementation Checklist

- [x] Install SendGrid package
- [x] Add environment variables
- [x] Create email service
- [x] Create OTP model
- [x] Update User model
- [x] Implement 2FA endpoints
- [x] Create notification controllers
- [x] Set up cron jobs
- [x] Integrate with track upload
- [x] Create frontend settings page
- [x] Test email templates
- [x] Document implementation

---

**Implementation Date**: March 24, 2026  
**Version**: 1.0.0  
**Status**: ✅ Complete and Production Ready
