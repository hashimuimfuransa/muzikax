# Quick Start Guide - Home Page Components

## For Developers New to This Codebase

### Understanding the Structure

The home page is now split into **manageable components**. Here's what you need to know:

```
page.tsx (7 lines) 
  ↓ imports
HomeClient.tsx (orchestrates everything)
  ↓ passes data to
┌─────────────────────────────────────┐
│ HeroSection            (Carousel)   │
│ TrendingNowSection     (Tracks)     │
│ TopArtistsSection      (Artists)    │
│ PopularArtistsSection  (Artists)    │
│ PopularAlbumsSection   (Albums)     │
│ PopularMixesSection    (Mixes)      │
│ MobileCategoriesScroll (Filter)     │
└─────────────────────────────────────┘
```

## Common Tasks

### 1. Adding a New Section

**Step 1**: Create new component in `components/home/`
```tsx
// components/home/NewSection.tsx
interface NewSectionProps {
  data: any;
}

export default function NewSection({ data }: NewSectionProps) {
  return <section>...</section>;
}
```

**Step 2**: Export in `index.ts`
```ts
export { default as NewSection } from './NewSection';
```

**Step 3**: Import and use in `HomeClient.tsx`
```tsx
import NewSection from './NewSection';

// Inside HomeClient component
<NewSection data={...} />
```

### 2. Modifying an Existing Section

**Find the file**: Each section is in its own file
- Hero → `HeroSection.tsx`
- Trending Tracks → `TrendingNowSection.tsx`
- Artists → `TopArtistsSection.tsx` or `PopularArtistsSection.tsx`
- Albums → `PopularAlbumsSection.tsx`
- Mixes → `PopularMixesSection.tsx`

**Make changes**: Edit only that file - no need to touch others!

### 3. Changing Data Flow

All data fetching happens in `HomeClient.tsx`:

```tsx
// Fetch data
const { tracks: trendingTracksData, loading } = useTrendingTracks(0);

// Transform data
const tracks = trendingTracksData.map(track => ({ ... }));

// Pass to component
<TrendingNowSection tracks={tracks} loading={loading} />
```

### 4. Styling Changes

Each component uses the same CSS classes from the original design:
- `gradient-text-animated` - Gradient text
- `card-glow` - Card hover effects  
- `btn-primary` - Primary buttons
- CSS variables: `var(--background)`, `var(--card-bg)`

No changes needed unless you want different styling per section.

## Component Responsibilities

| Component | Fetches Data? | Manages State? | Can Be Reused? |
|-----------|--------------|----------------|----------------|
| HomeClient | ✅ Yes | ✅ Yes | ❌ No |
| HeroSection | ❌ No | ✅ Internal | ✅ Yes |
| TrendingNow | ❌ No | ❌ No | ✅ Yes |
| TopArtists | ❌ No | ❌ No | ✅ Yes |
| PopularArtists | ❌ No | ❌ No | ✅ Yes |
| PopularAlbums | ❌ No | ✅ Internal | ✅ Yes |
| PopularMixes | ❌ No | ❌ No | ✅ Yes |
| MobileCategories | ❌ No | ❌ No | ✅ Yes |

## Props Interfaces

Each component has TypeScript interfaces defining what it accepts:

```tsx
// Example from TrendingNowSection
interface TrendingNowSectionProps {
  tracks: Track[];      // Array of track objects
  loading: boolean;     // Loading state
  rawTracks?: any[];    // Optional: raw API data for audio playback
}
```

Check each component's interface before making changes.

## Debugging Tips

### Issue: Section not displaying data

1. Check if data is being fetched in `HomeClient.tsx`
2. Verify props are being passed correctly
3. Look at browser console for errors
4. Check loading states

### Issue: Click handlers not working

1. Verify the handler is defined in the component
2. Check if it needs data from parent (HomeClient)
3. Ensure event propagation isn't blocked

### Issue: Styling broken

1. Check if CSS classes match original design
2. Verify CSS variables are defined in globals.css
3. Look for typos in class names

## Performance Considerations

### What's Already Optimized
✅ Memoized data transformations
✅ Efficient list rendering with keys
✅ Conditional rendering based on loading states
✅ Duplicate track removal

### Future Optimizations
- Add React.memo to prevent unnecessary re-renders
- Implement virtual scrolling for long lists
- Lazy load sections below the fold
- Add suspense boundaries

## Testing

### Manual Testing Checklist
- [ ] Desktop view (1920px, 1366px, 1024px)
- [ ] Tablet view (768px)
- [ ] Mobile view (375px, 414px)
- [ ] All click handlers work
- [ ] Loading states show correctly
- [ ] Empty states handled gracefully
- [ ] Animations smooth (60fps)

### Automated Testing (Future)
```tsx
// Example test structure
describe('HeroSection', () => {
  it('renders hero slides', () => {...});
  it('auto-advances slides', () => {...});
  it('handles CTA clicks', () => {...});
});
```

## Git Workflow

When making changes:

1. **Branch off**: `git checkout -b feature/update-hero-section`
2. **Make changes**: Only edit relevant component files
3. **Test locally**: Run `npm run dev` and verify
4. **Commit**: `git commit -m "Update HeroSection slide count"`
5. **PR**: Create pull request for review

## Questions?

### "Which component handles X?"
→ Check the component list above or search in `components/home/`

### "Where do I add Y feature?"
→ If it's global: `HomeClient.tsx`
→ If it's section-specific: That section's component file

### "How do I pass Z data?"
→ Add to props interface → Pass from HomeClient → Receive in component

## File Locations Quick Reference

```
# Main container
frontend/src/components/home/HomeClient.tsx

# Individual sections
frontend/src/components/home/HeroSection.tsx
frontend/src/components/home/TrendingNowSection.tsx
frontend/src/components/home/TopArtistsSection.tsx
frontend/src/components/home/ForYouSection.tsx
frontend/src/components/home/PopularArtistsSection.tsx
frontend/src/components/home/PopularAlbumsSection.tsx
frontend/src/components/home/PopularMixesSection.tsx
frontend/src/components/home/MobileCategoriesScroll.tsx

# Barrel exports (import all at once)
frontend/src/components/home/index.ts

# Documentation
frontend/src/components/home/README.md
frontend/src/components/home/REFACTORING_SUMMARY.md
```

## Need More Help?

1. Read component-level comments in each file
2. Check REFACTORING_SUMMARY.md for the big picture
3. Review README.md for detailed documentation
4. Look at existing implementations for patterns

---

**Remember**: The goal was to make maintenance EASIER. If something feels complicated, there's probably a simpler way - ask for help!
