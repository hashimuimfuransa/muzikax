# Infinite Loop Fix - Profile Page

## Problem
The profile page was stuck in an infinite loop, continuously fetching data and reloading.

## Root Cause
```typescript
// BEFORE (WRONG)
useEffect(() => {
  const fetchProfileData = async () => {
    await fetchUserProfile()  // This updates user state
    setProfile({...})          // This also updates state
  }
  fetchProfileData()
}, [user, router, fetchUserProfile])  // ← fetchUserProfile causes re-run!
```

**Why this caused infinite loop:**
1. Component mounts → `useEffect` runs
2. Calls `fetchUserProfile()` 
3. `fetchUserProfile()` updates AuthContext user state
4. User state change triggers component re-render
5. Re-render causes `useEffect` to run again (because `fetchUserProfile` is in dependency array)
6. Go to step 2 → **INFINITE LOOP**

## Solution
```typescript
// AFTER (CORRECT)
useEffect(() => {
  const fetchProfileData = async () => {
    // Use user data from AuthContext directly
    if (user) {
      setProfile({...})  // Just use existing user data
      // Fetch tracks, analytics, etc.
    }
  }
  fetchProfileData()
}, [user, router])  // ← Removed fetchUserProfile from dependencies
```

**Why this fixes it:**
1. Component mounts → `useEffect` runs ONCE
2. Uses user data that's already in AuthContext (from login)
3. No additional state updates that would trigger re-render
4. Effect only re-runs if `user` or `router` changes (which is correct behavior)

## How AuthContext Works

### Login Flow
```typescript
1. User logs in
   ↓
2. Backend returns user data + tokens
   ↓
3. AuthContext.login() stores user in state + localStorage
   ↓
4. AuthContext ALSO calls fetchUserProfile() automatically
   ↓
5. fetchUserProfile() gets fresh data from /api/auth/me
   ↓
6. Updates AuthContext user with fresh data
   ↓
7. All components using useAuth() get updated user
```

### Profile Page Usage
```typescript
const { user } = useAuth()  // Get user from context

// User already has:
// - followersCount (fresh from backend)
// - followingCount (fresh from backend)
// - role, creatorType, etc.
// NO need to call fetchUserProfile() again!
```

## Best Practices

### ✅ DO:
```typescript
// Use user data from AuthContext directly
useEffect(() => {
  if (user) {
    setProfile({
      followersCount: user.followersCount || 0,
      followingCount: user.followingCount || 0,
      ...
    })
  }
}, [user])
```

### ❌ DON'T:
```typescript
// Don't call fetchUserProfile in useEffect
useEffect(() => {
  await fetchUserProfile()  // Creates loop!
  setProfile({...})
}, [fetchUserProfile])  // Function in deps = bad!
```

### ✅ BETTER:
```typescript
// Let AuthContext handle profile refresh
// It already runs on login automatically
useEffect(() => {
  if (user) {
    // Just use the data
    setProfile({...})
  }
}, [user])  // Only depend on user, not functions
```

## Testing

### Before Fix
- Open profile page
- Watch network tab → constant API calls
- Console logs → repeated "Fetched tracks", "Fetched analytics"
- Page flickers/reloads continuously
- Browser becomes unresponsive

### After Fix
- Open profile page
- Network tab → single API call per endpoint
- Console logs → one-time "Fetched tracks", "Fetched analytics"
- Page loads smoothly once
- No repeated renders

## Additional Notes

### Why AuthContext Already Has Fresh Data
```typescript
// In AuthContext.tsx
useEffect(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    setUser(JSON.parse(storedUser))
    fetchUserProfile()  // ← Automatically refreshes on mount!
  }
}, [])
```

So by the time you access `user` in your profile page, it's already fresh!

### When to Call fetchUserProfile Manually
Only call it manually if:
1. User just updated their profile (edit profile page)
2. User just followed/unfollowed someone
3. You need to force-refresh after a mutation

Example:
```typescript
const handleFollow = async () => {
  await followCreator(creatorId)
  await fetchUserProfile()  // Refresh counts after follow
}
```

## Files Modified
- `frontend/src/app/profile/page.tsx` - Fixed infinite loop

## Related Files
- `frontend/src/contexts/AuthContext.tsx` - Manages user state
- `backend/src/controllers/authController.js` - GET /api/auth/me endpoint
