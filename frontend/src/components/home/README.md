# Home Page Components

This directory contains the refactored home page components, broken down into manageable, reusable sections.

## Component Structure

### Main Container
- **`HomeClient.tsx`** - Main container component that combines all home page sections and manages global state

### Section Components

1. **`HeroSection.tsx`**
   - Auto-sliding hero carousel with 3 slides
   - Animated waveform background
   - Call-to-action buttons
   - Slide indicators

2. **`TrendingNowSection.tsx`**
   - Horizontal scrollable track cards
   - Shows trending tracks (excluding beats)
   - Play count and like count displays
   - Skeleton loading states

3. **`TopArtistsSection.tsx`**
   - Grid layout of popular creators
   - Artist avatars with verification badges
   - Follower counts
   - Follow button functionality

4. **`ForYouSection.tsx`**
   - Personalized track recommendations
   - Mobile list view + Desktop grid view
   - Favorite/like toggle
   - Audio player integration

5. **`PopularArtistsSection.tsx`**
   - Secondary artist showcase
   - Similar to Top Artists but different styling
   - Direct navigation to artist profiles

6. **`PopularAlbumsSection.tsx`**
   - Album grid display
   - Play album functionality
   - Release year and track count
   - Loading skeleton states

7. **`PopularMixesSection.tsx`**
   - Mixes/podcasts showcase
   - Filtered by category "mix"
   - Duration and like displays

8. **`MobileCategoriesScroll.tsx`**
   - Mobile-only category filter bar
   - Sticky positioning
   - Genre-based navigation

## Features

### Responsive Design
- All components are fully responsive
- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl

### Animations
- Framer Motion for smooth transitions
- Scroll-triggered animations
- Hover effects and micro-interactions
- Loading skeletons

### State Management
- Centralized state in HomeClient
- Audio player context integration
- Favorites management
- Real-time data updates

### Performance
- Lazy loading where applicable
- Optimized re-renders
- Efficient data transformation
- Duplicate track removal

## Usage

The main entry point is through `HomeClient.tsx`, which is imported in `page.tsx`:

```tsx
// page.tsx
import HomeClient from "../components/home/HomeClient";

export default function Home() {
  return <HomeClient />;
}
```

## Data Flow

1. **HomeClient** fetches all data:
   - Trending tracks via `useTrendingTracks`
   - Popular creators via `usePopularCreators`
   - Albums via direct API call

2. **Data Transformation**:
   - Raw API data transformed to match component interfaces
   - Duplicate removal
   - Category filtering

3. **Props Distribution**:
   - Transformed data passed down to section components
   - Each component manages its own UI state

## Benefits of This Structure

1. **Maintainability**: Each section is isolated and can be updated independently
2. **Reusability**: Components can be used on other pages
3. **Testability**: Smaller, focused components are easier to test
4. **Performance**: Better code splitting and lazy loading opportunities
5. **Scalability**: Easy to add new sections or modify existing ones

## Future Enhancements

- Add error boundaries to each section
- Implement virtual scrolling for large lists
- Add A/B testing capabilities
- Create loading error states
- Add analytics tracking per section
