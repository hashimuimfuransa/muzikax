# Quick Reference: Unique Plays Display

## 🎨 Artist Profile Page

### Location
`/artists/[id]` - Individual artist profile pages

### What Changed

#### Artist Header Stats
```
Before: Followers | Tracks | Total Plays | Since
After:  Followers | Tracks | Total Plays | Unique Listeners | Since
```

#### Individual Track Display
```tsx
// Shows under each track in the list
"150,000 plays"
"87,500 unique"  // ← New line (smaller, darker text)
❤️ 12,500
```

### Visual Example
```
┌─────────────────────────────────────┐
│  [Artist Avatar]  ARTIST NAME       │
│                   ✓ Verified Artist │
│                                     │
│  125K      42    150K    87K   2023│
│ Followers Tracks Plays  Unique Since│
└─────────────────────────────────────┘

Track List:
┌───────────────────────────────────┐
│ [Cover] Song Title                │
│         Artist Name               │
│                        15K plays  │
│                         9.2K unique│
│                        ❤️ 1,250   │
└───────────────────────────────────┘
```

---

## 📊 Admin Dashboard

### Location
`/admin/analytics` - Analytics dashboard page

### What Changed

#### Stats Cards (Top Row)
```
Before: Users | Creators | Tracks | Plays
After:  Users | Creators | Tracks | Plays + Unique Listeners
```

**New Card Added:**
```
┌────────────────────────────┐
│ Unique Listeners           │
│ 89,250                     │
│ Across top tracks          │
│ [👥 Purple Icon]          │
└────────────────────────────┘
```

#### Most Played Tracks Table
```
Before: Rank | Track | Creator | Plays | Likes
After:  Rank | Track | Creator | Plays | Unique | Likes
```

**Table Example:**
```
┌────────────────────────────────────────────────────┐
│ # │ Track        │ Creator    │ Plays  │ Unique │ Likes │
├────────────────────────────────────────────────────┤
│ 1 │ Hit Song     │ Top Artist │ 125,000│ 89,000 │ 12.5K │
│ 2 │ Popular Beat │ Producer   │ 98,500 │ 67,200 │ 8.9K  │
│ 3 │ Viral Mix    │ DJ Name    │ 87,000 │ 52,300 │ 7.1K  │
└────────────────────────────────────────────────────┘
```

---

## 🔍 Data Interpretation

### For Artists

**Healthy Ratio:**
- **Total Plays / Unique Listeners ≈ 1.5 - 3.0**
- Indicates good engagement and repeat listens

**Example Analysis:**
```
Total Plays: 150,000
Unique Listeners: 87,000
Ratio: 1.72 plays per listener
Verdict: ✅ Strong fan engagement
```

**Warning Signs:**
- Ratio > 5.0: Possible play manipulation
- Ratio < 1.2: Low engagement, listeners not returning

### For Administrators

**Platform Health Metrics:**
```
Total Plays: 1,250,000
Unique Listeners: 875,000
Platform Ratio: 1.43
Status: ✅ Healthy engagement
```

**Fraud Detection:**
```
Track A: 100K plays, 85K unique (1.18 ratio) ✅ Normal
Track B: 100K plays, 5K unique (20.0 ratio) ⚠️ Suspicious
```

---

## 🎯 Key Features

### Responsive Design
- ✅ Mobile-friendly layouts
- ✅ Adaptive text sizes
- ✅ Touch-optimized interactions

### Visual Hierarchy
- **Primary metrics:** Larger, lighter color
- **Secondary metrics:** Smaller, darker color
- **Icons:** Consistent sizing and spacing

### Accessibility
- High contrast text
- Clear visual separation
- Descriptive labels
- Screen reader friendly

---

## 🛠️ Troubleshooting

### If Unique Plays Not Showing

**Check:**
1. Backend API returning `uniquePlays` field?
2. Migration script run on database?
3. PlayHistory data exists?
4. Browser console for errors?

**Quick Fix:**
```javascript
// Check if data is available
console.log('Track data:', track);
console.log('Unique plays:', track.uniquePlays);
console.log('Stats:', stats);
```

### If Layout Broken

**Common Issues:**
- Missing Tailwind classes
- Incorrect nesting of JSX
- Undefined value access

**Solution:**
```typescript
// Always check for undefined
{track.uniquePlays !== undefined && (
  <p>{track.uniquePlays.toLocaleString()} unique</p>
)}

// Use optional chaining
{stats?.totalUniquePlays}
```

---

## 📱 Screenshots Reference

### Artist Profile (Desktop)
```
[Large Artist Banner]
├─ Profile Picture
├─ Artist Name (H1)
├─ Verified Badge
├─ Stats Row:
│  ├─ Followers
│  ├─ Tracks  
│  ├─ Total Plays
│  ├─ Unique Listeners ← NEW
│  └─ Since
└─ Follow Button

[Content Area]
├─ Search & Tabs
└─ Track List
   ├─ Track 1
   │  ├─ Cover Art
   │  ├─ Title
   │  ├─ Plays count
   │  ├─ Unique count ← NEW
   │  └─ Likes
   └─ Track 2...
```

### Admin Dashboard
```
[Header]
└─ Analytics Dashboard Title

[Time Range Selector]

[Stats Cards Row]
├─ Users Card
├─ Creators Card
├─ Tracks Card
├─ Plays Card
└─ Unique Listeners Card ← NEW

[Charts Grid]
├─ User Growth Chart
├─ User Roles Pie
├─ Content Types Bar
└─ Top Creators Bar

[Bottom Section]
├─ Most Played Tracks Table
│  └─ Unique Column ← NEW
└─ Creator Types Pie
```

---

## 🚀 Performance Tips

### Frontend
```typescript
// Memoize expensive calculations
const totalUniquePlays = useMemo(() => {
  return mostPlayedTracks.reduce((sum, track) => 
    sum + (track.uniquePlays || 0), 0
);
}, [mostPlayedTracks]);

// Conditional rendering
{stats?.totalUniquePlays !== undefined && (
  <StatValue>{formatNumber(stats.totalUniquePlays)}</StatValue>
)}
```

### Backend
```javascript
// Index for faster queries
TrackSchema.index({ uniquePlays: -1 });

// Aggregation optimization
db.tracks.aggregate([
  { $match: { creatorId: ObjectId("...") } },
  { $group: { 
    _id: null,
    totalUniquePlays: { $sum: "$uniquePlays" }
  }}
]);
```

---

## 📞 Support

### Documentation
- Full Guide: `UNIQUE_PLAYS_INTEGRATION_COMPLETE.md`
- Implementation: `UNIQUE_PLAYS_IMPLEMENTATION.md`
- Backend Setup: `backend/UNIQUE_PLAYS_README.md`

### Common Questions

**Q: Why are some unique plays showing as "-"?**
A: Data not available for older tracks. Run migration script.

**Q: Can I hide unique plays from public view?**
A: Currently always visible. Feature request for privacy settings.

**Q: How often do unique plays reset?**
A: Daily at midnight UTC per listener.

---

**Last Updated:** March 24, 2026  
**Version:** 1.0  
**Status:** Production Ready
