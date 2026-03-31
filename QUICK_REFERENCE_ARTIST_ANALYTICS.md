# Artist Analytics - Quick Reference Guide

## 🎯 What's Fixed

### Before ❌
- Profile showed other artists' tracks
- No analytics data visible
- Couldn't see plays or listeners
- No geographic insights
- Limited performance metrics

### After ✅
- Profile shows ONLY your tracks (authenticated)
- Complete analytics dashboard
- Plays, monthly listeners, unique listeners
- Country-level geography data
- Track-by-track performance breakdown

## 📊 Analytics Metrics Explained

| Metric | What It Means | How It's Calculated |
|--------|---------------|---------------------|
| **Total Plays** | All-time streams | Sum of `plays` field on all tracks |
| **Monthly Listeners** | Active fans (30 days) | Unique IPs in last 30 days |
| **Unique Listeners** | One-time listeners | Sum of `uniquePlays` on all tracks |
| **Total Likes** | Fan engagement | Sum of `likes` on all tracks |
| **Total Tracks** | Your discography | Count of uploaded tracks |

## 🗺️ Geographic Data

**Top Countries Display:**
- Shows top 10 countries by listener count
- Based on ListenerGeography collection
- Each play records IP → Country mapping
- Sorted by total plays per country

**Example:**
```
🇺🇸 United States: 1,250 listeners
🇬🇧 United Kingdom: 890 listeners
🇳🇬 Nigeria: 650 listeners
```

## 🔐 Security

**Authentication Required:**
- `/api/tracks/creator` - Needs valid JWT token
- `/api/creator/analytics` - Needs creator role
- `/api/creator/tracks` - Needs creator role

**Data Isolation:**
- Backend uses `req.user._id` (server-side)
- Can't manipulate user ID from frontend
- Each creator only sees their own data

## 🚀 Access Points

### Profile Page
```
URL: /profile
Shows: Analytics summary + Your tracks
Button: "View Analytics" → goes to detailed page
```

### Analytics Dashboard
```
URL: /profile/analytics
Shows: Full dashboard with all metrics
Features: Geography, track performance, trends
```

## 📱 Responsive Layout

**Mobile:**
- 2-column metrics grid
- Horizontal scrolling countries
- Single column tracks

**Desktop:**
- 5-column metrics grid
- Full country list visible
- 3-column track grid

## 🎨 UI Color Coding

- 🔴 **Red/Pink** (#FF4D67) - Total Plays
- 🟢 **Green** (#10B981) - Monthly Listeners  
- 🔴 **Red** (#EF4444) - Unique Listeners
- 🟣 **Purple** (#8B5CF6) - Total Likes
- 🟡 **Yellow** (#FFCB2B) - Total Tracks
- 🔵 **Blue/Purple** (#6366F1) - Analytics section

## 🔧 API Endpoints

### Get Your Tracks
```http
GET /api/tracks/creator
Authorization: Bearer <token>
```

### Get Analytics
```http
GET /api/creator/analytics
Authorization: Bearer <token>
```

### Get Detailed Tracks
```http
GET /api/creator/tracks?limit=100
Authorization: Bearer <token>
```

## 🧪 Testing Checklist

- [ ] Login as creator
- [ ] Visit /profile
- [ ] Verify only YOUR tracks show
- [ ] Check analytics summary appears
- [ ] Click "View Analytics"
- [ ] Verify all 5 metrics display
- [ ] Check geography section
- [ ] View track performance cards
- [ ] Test mobile responsiveness
- [ ] Logout and verify redirect

## ⚠️ Common Issues

### "Analytics not showing"
**Solution:** Make sure user has `role: 'creator'` or `creatorType` set

### "Wrong tracks displaying"
**Solution:** Verify using `/api/tracks/creator` endpoint (not `/api/tracks?creatorId=...`)

### "Monthly listeners = 0"
**Solution:** Need recent plays (last 30 days) with geography tracking

## 📈 Future Features

**Coming Soon:**
- Trend percentages (↗️ +12%)
- Custom date ranges
- Interactive charts
- Real-time updates
- Export reports (PDF/CSV)
- Revenue tracking

## 💡 Pro Tips

1. **Check Monthly Listeners** - This shows your CURRENT fanbase size
2. **Monitor Geography** - See where you're popular globally
3. **Track Performance** - Identify which songs resonate most
4. **Compare Metrics** - Unique vs Total plays shows replay value

## 🎯 Key Benefits for Artists

✅ **Know Your Audience** - See where fans are located
✅ **Track Growth** - Monitor monthly listener trends
✅ **Measure Engagement** - Plays vs Unique shows loyalty
✅ **Plan Tours** - Geographic data reveals hot markets
✅ **Optimize Releases** - See which tracks perform best

---

**Need Help?** Check the full documentation: `ARTIST_ANALYTICS_DASHBOARD_COMPLETE.md`
