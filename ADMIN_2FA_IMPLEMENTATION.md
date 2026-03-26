# Admin Two-Factor Authentication (2FA) Implementation

## Overview
Two-factor authentication (2FA) using OTP email verification has been implemented for admin users logging into the MuzikaX platform. This adds an extra layer of security to admin accounts.

## Changes Made

### Backend Changes

#### 1. **Updated `twoFAController.js`** (`backend/src/controllers/twoFAController.js`)
- Modified `requestOTP()` to accept admin users in addition to artist accounts
- Modified `verifyOTPAndLogin()` to handle admin authentication
- Modified `resendOTP()` to support admin users
- Updated validation logic: `(user.role !== 'creator' || user.creatorType !== 'artist') && user.role !== 'admin'`

#### 2. **Updated `authController.js`** (`backend/src/controllers/authController.js`)
- Added imports for OTP model and email service
- Modified login flow to send OTP for admin users
- When an admin logs in:
  1. Password is verified
  2. OTP is generated and sent via email
  3. Login response includes `requires2FA: true`
  4. Frontend must verify OTP to complete login
- Updated refresh token logic to require re-login for admins attempting to bypass 2FA

### Frontend Changes

#### 1. **Updated Login Page** (`frontend/src/app/login/page.tsx`)
- Updated comment from "Artist 2FA" to "2FA - OTP Verification for Artists and Admins"
- Enhanced UI messaging to mention 10-minute expiration
- The existing 2FA flow now automatically works for admins

## How It Works

### Login Flow for Admins

1. **Step 1: Enter Email**
   - Admin enters their email address
   - Clicks "Next"

2. **Step 2: Enter Password**
   - Admin enters their password
   - Clicks "Sign in"

3. **Step 3: Backend Verification**
   - Backend verifies password is correct
   - Backend generates 6-digit OTP
   - OTP is sent to admin's email via SendGrid
   - Response includes:
     ```json
     {
       "_id": "...",
       "name": "...",
       "email": "...",
       "role": "admin",
       "requires2FA": true,
       "message": "OTP sent to your email. Please verify to complete login.",
       "nextStep": "verify-otp",
       "expiresInSeconds": 600
     }
     ```

4. **Step 4: OTP Verification**
   - Frontend displays 2FA screen
   - Admin enters 6-digit code from email
   - Code is verified via `/api/auth/2fa/verify`
   - On success:
     - Access token and refresh token are stored
     - Admin is redirected to `/admin` dashboard

5. **Step 5: Resend OTP (if needed)**
   - Admin can click "Resend Code"
   - New OTP is generated and sent
   - Valid for 10 minutes

## Security Features

### OTP Properties
- **Length**: 6 digits
- **Validity**: 10 minutes
- **Attempts**: Limited failed attempts before lockout
- **Purpose**: Specifically for 'login'
- **Delivery**: Email via SendGrid

### Failed Login Handling
- Incorrect password increments failed attempt counter
- Incorrect OTP increments failed attempt counter
- Too many failed attempts temporarily locks the account
- Admin must wait or contact support if locked out

### Token Security
- Access tokens: Short-lived (1 hour)
- Refresh tokens: Long-lived but revoked on 2FA bypass attempt
- Tokens stored in localStorage
- Required for all authenticated API requests

## API Endpoints Used

### Request OTP
```http
POST /api/auth/2fa/request
Content-Type: application/json

{
  "email": "admin@muzikax.com"
}
```

### Verify OTP and Complete Login
```http
POST /api/auth/2fa/verify
Content-Type: application/json

{
  "email": "admin@muzikax.com",
  "otp": "123456",
  "password": "securePassword123!"
}
```

### Resend OTP
```http
POST /api/auth/2fa/resend
Content-Type: application/json

{
  "email": "admin@muzikax.com"
}
```

## User Experience

### What Admins See
1. Normal login form (email + password)
2. After password submission: "Two-Factor Authentication" screen
3. Message: "We've sent a 6-digit verification code to [email]"
4. Input field for 6-digit code
5. "Verify & Continue" button
6. "Resend Code" option
7. Expiration notice: "Valid for 10 minutes"

### Error Messages
- "Invalid credentials" - Wrong password
- "Invalid verification code" - Wrong OTP
- "Verification code expired" - Code older than 10 minutes
- "Too many failed attempts" - Account temporarily locked
- "Failed to send verification code" - Email service error

## Testing

### Test Scenarios
1. ✅ Admin login with correct credentials
2. ✅ Admin receives OTP email
3. ✅ Admin enters correct OTP → Success
4. ✅ Admin enters wrong OTP → Error message
5. ✅ Admin lets OTP expire → Error message
6. ✅ Admin resends OTP → New code sent
7. ✅ Admin tries to bypass 2FA → Redirected to login
8. ✅ Artist login still works as before
9. ✅ Regular user login unaffected

### Test Credentials
Use admin test account:
- Email: `admin@muzikax.com`
- Password: [Your admin password]
- Check email for OTP

## Benefits

1. **Enhanced Security**: Prevents unauthorized access even if password is compromised
2. **Email Verification**: Ensures admin has access to registered email
3. **Time-Limited**: OTP expires after 10 minutes
4. **Attempt Limiting**: Prevents brute force attacks
5. **Audit Trail**: OTP requests and verifications are logged
6. **User-Friendly**: Simple 6-digit code, no app required

## Future Enhancements

Potential improvements for the future:
- [ ] TOTP support (Google Authenticator, Authy)
- [ ] SMS OTP as alternative to email
- [ ] Remember device option (skip 2FA for trusted devices)
- [ ] Backup codes for emergency access
- [ ] 2FA setup wizard for new admins
- [ ] QR code for easier TOTP enrollment

## Troubleshooting

### Admin Not Receiving OTP Email
1. Check spam/junk folder
2. Verify email address is correct in system
3. Check SendGrid dashboard for delivery status
4. Verify email service configuration
5. Check server logs for email sending errors

### OTP Verification Failing
1. Ensure code is entered correctly (6 digits)
2. Check if code has expired (10 minutes)
3. Verify no extra spaces in input
4. Check server logs for OTP validation errors
5. Ensure OTP record exists in database

### Locked Out
1. Wait for lockout period to expire (typically 15-30 minutes)
2. Contact system administrator if urgent access needed
3. Check database for failed attempt count
4. Manually reset failed attempts if necessary

## Database Schema

### User Model
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  role: "admin" | "creator" | "fan",
  creatorType: "artist" | "dj" | "producer" (for creators),
  is2FAEnabled: Boolean,
  twoFactorSecret: String (encrypted),
  name: String,
  // ... other fields
}
```

### OTP Model
```javascript
{
  _id: ObjectId,
  email: String,
  otp: String (hashed),
  purpose: "login",
  expiresAt: Date,
  attempts: Number,
  createdAt: Date
}
```

## Related Files
- `backend/src/controllers/authController.js`
- `backend/src/controllers/twoFAController.js`
- `backend/src/models/OTP.js`
- `backend/src/models/User.js`
- `backend/src/services/emailService.js`
- `frontend/src/app/login/page.tsx`
- `frontend/src/contexts/AuthContext.tsx`

## Support
For issues or questions about 2FA implementation:
- Check server logs: `backend/logs/`
- Review email service logs
- Contact development team
- Refer to API documentation
