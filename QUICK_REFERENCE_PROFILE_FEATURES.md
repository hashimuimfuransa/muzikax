# Quick Reference - Profile & Social Features

## What's Working Now ✅

### Profile Page (`/profile`)
- **Tracks Count**: Shows YOUR actual uploaded tracks
- **Followers Count**: Real-time count of people following you
- **Following Count**: Real-time count of creators you follow
- **Monthly Listeners**: For creators (last 30 days)
- **Analytics Summary**: For creators (plays, likes, geography)

### Clickable Stats
Click any stat in the profile header to navigate:
- **Tracks** → `/profile/tracks` (planned)
- **Followers** → `/profile/followers` ✅
- **Following** → `/profile/following` ✅
- **Monthly Listeners** → `/profile/analytics` ✅ (desktop)

### Mobile vs Desktop

#### Mobile (< 768px)
- **Top Right**: 3-dot menu button
- **Tap Menu**: Shows dropdown with all actions
- **Stats**: 2-column grid, all clickable

#### Desktop (≥ 768px)
- **Action Buttons**: 4 horizontal buttons with icons
- **Stats**: 5-column grid (includes Monthly Listeners)
- **All Features**: Same as mobile + more visible

## How to Use

### View Your Followers
1. Go to your profile (`/profile`)
2. Click on "Followers" count/stat
3. See list of all people following you
4. Click any follower to view their profile

### View Who You Follow
1. Go to your profile (`/profile`)
2. Click on "Following" count/stat
3. See list of all creators you follow
4. Click any creator to view their profile

### Edit Profile
- **Mobile**: Tap 3-dot menu → "Edit Profile"
- **Desktop**: Click "Edit Profile" button

### View Analytics (Creators Only)
- **Mobile**: Tap 3-dot menu → "View Analytics"
- **Desktop**: Click "View Analytics" button
- **Or**: Click "Monthly Listeners" stat (desktop)

## API Endpoints

### Get Your Data
```http
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: Complete user profile with counts
```

### Get Your Tracks
```http
GET /api/tracks/creator
Headers: Authorization: Bearer <token>
Response: Your uploaded tracks
```

### Get Your Followers
```http
GET /api/users/:id/followers
Headers: Authorization: Bearer <token>
Response: List of users who follow you
```

### Get Who You Follow
```http
GET /api/following
Headers: Authorization: Bearer <token>
Response: List of users you follow
```

### Get Analytics (Creators)
```http
GET /api/creator/analytics
Headers: Authorization: Bearer <token>
Response: Plays, listeners, geography, likes
```

## Troubleshooting

### Shows 0 Followers/Following
**Solution:** 
1. Refresh page (F5)
2. Check if actually following anyone
3. Logout and login again
4. Verify database has correct counts

### Can't Access Pages
**Solution:**
1. Make sure you're logged in
2. Check token is valid (not expired)
3. Try logout and login again
4. Clear browser cache

### Analytics Not Showing
**Solution:**
1. Must be creator role (artist/dj/producer)
2. Upgrade account to creator first
3. Upload at least one track
4. Wait for data to populate

## File Locations

### Frontend Pages
```
frontend/src/app/profile/
├── page.tsx                    # Main profile page
├── analytics/
│   └── page.tsx                # Analytics dashboard
├── followers/
│   └── page.tsx                # Followers list
└── following/
    └── page.tsx                # Following list
```

### Backend Controllers
```
backend/src/controllers/
├── userController.js           # User/follower functions
├── creatorController.js        # Creator analytics
└── authController.js           # Auth & profile refresh
```

### Backend Routes
```
backend/src/routes/
├── userRoutes.js               # User/follower routes
├── creatorRoutes.js            # Creator routes
└── trackRoutes.js              # Track routes
```

## Data Flow

```
User Login
    ↓
AuthContext stores user + tokens
    ↓
Navigate to Profile
    ↓
fetchUserProfile() called
    ↓
Backend: GET /api/auth/me
    ↓
Returns fresh user data
    ↓
Profile displays:
- Tracks from /api/tracks/creator
- Followers: user.followersCount
- Following: user.followingCount
- Analytics: /api/creator/analytics
```

## Testing

### As a Creator
1. Login with creator account
2. Check all counts are correct
3. Click each stat → navigates
4. View analytics → all metrics show
5. Test mobile menu
6. Test desktop buttons

### As a Fan
1. Login with fan account
2. Follow some creators
3. Go to profile
4. Following count should update
5. Click Following → see list
6. Analytics section should NOT appear

## Next Steps (Planned)

### Favorites Page
- Show all favorited tracks
- Like/unlike from page
- Sort by date added

### Tracks Page
- Dedicated tracks management
- Bulk edit/delete
- Performance stats per track

### Enhanced Social
- Remove followers option
- Block users
- Privacy settings

---

**Need Help?** Check full documentation: `PROFILE_FOLLOWERS_FOLLOWING_COMPLETE.md`
