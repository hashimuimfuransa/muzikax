# Production Error Handling & Loading States Guide

This guide explains the comprehensive error handling and loading state system implemented in MuzikaX frontend.

## Overview

The error handling system provides:
- ✅ User-friendly error messages for production
- ✅ Toast notifications for user feedback
- ✅ Network status monitoring
- ✅ Loading skeletons and overlays
- ✅ Error boundaries for crash prevention
- ✅ Automatic retry logic with exponential backoff

## Components

### 1. ErrorBoundary (`components/ErrorBoundary.tsx`)

Catches React component errors and displays a friendly error page.

**Usage:**
```tsx
import ErrorBoundary from '../components/ErrorBoundary';

// Wrap your app or specific components
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomFallback />}>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Beautiful error UI with gradient background
- "Refresh Page" and "Go Home" buttons
- Development mode shows error details
- Production-ready messaging

### 2. ToastProvider (`contexts/ToastContext.tsx`)

Provides toast notification system throughout the app.

**Usage:**
```tsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  const handleAction = () => {
    try {
      // Your code here
      showSuccess('Action completed successfully!');
    } catch (error) {
      showError('Something went wrong. Please try again.');
    }
  };
}
```

**Toast Types:**
- `success` - Green background with checkmark
- `error` - Red background with X mark
- `warning` - Yellow background with warning icon
- `info` - Blue background with info icon

**Options:**
```tsx
addToast({
  message: 'Custom message',
  type: 'info',
  duration: 5000, // Auto-close after 5 seconds (default)
});
```

### 3. Loading States (`components/LoadingStates.tsx`)

Reusable loading indicators and error displays.

#### LoadingOverlay
Full-screen loading overlay:
```tsx
import { LoadingOverlay } from '../components/LoadingStates';

function MyComponent({ loading }) {
  return (
    <>
      <LoadingOverlay show={loading} message="Loading tracks..." />
      {/* Your content */}
    </>
  );
}
```

#### LoadingSkeleton
Placeholder content while loading:
```tsx
import { LoadingSkeleton } from '../components/LoadingStates';

function TracksGrid({ loading }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {loading ? (
        <LoadingSkeleton type="album" count={6} />
      ) : (
        albums.map(album => <AlbumCard key={album.id} album={album} />)
      )}
    </div>
  );
}
```

**Skeleton Types:**
- `card` - Generic card skeleton
- `album` - Album cover with metadata
- `track` - Track row with play button
- `list` - List items with avatars

#### ErrorMessage
User-friendly error display:
```tsx
import { ErrorMessage } from '../components/LoadingStates';

function ContentArea({ error, onRetry }) {
  if (error) {
    return (
      <ErrorMessage
        title="Connection Issue"
        message="Unable to load tracks. Please check your internet connection."
        suggestion="Our servers might be temporarily unavailable."
        onRetry={onRetry}
        showRetryButton={true}
      />
    );
  }
  
  return <TracksList />;
}
```

#### OfflineBanner
Network status indicator:
```tsx
import { OfflineBanner } from '../components/LoadingStates';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

function App() {
  const { isOnline } = useNetworkStatus();
  
  return (
    <>
      {!isOnline && <OfflineBanner />}
      <MainContent />
    </>
  );
}
```

### 4. Network Status Hook (`hooks/useNetworkStatus.ts`)

Monitor online/offline status:

```tsx
import { useNetworkStatus } from '../hooks/useNetworkStatus';

function MyComponent() {
  const { isOnline, lastChecked } = useNetworkStatus();
  
  return (
    <div>
      {isOnline ? (
        <p>Connected</p>
      ) : (
        <p>Offline since {lastChecked.toLocaleTimeString()}</p>
      )}
    </div>
  );
}
```

### 5. Error Message Utilities (`utils/errorMessages.ts`)

Convert technical errors to user-friendly messages:

```tsx
import { getUserFriendlyError, formatErrorForToast, isNetworkError } from '../utils/errorMessages';

function handleError(error, statusCode) {
  // Get user-friendly message
  const friendlyError = getUserFriendlyError(error, statusCode);
  
  console.log(friendlyError.title);    // "Connection Issue"
  console.log(friendlyError.message);  // "We're having trouble connecting..."
  console.log(friendlyError.suggestion); // "Check your connection..."
  
  // Format for toast
  const toastError = formatErrorForToast(error, statusCode);
  showToast(toastError.message, toastError.type);
  
  // Check error type
  if (isNetworkError(error)) {
    // Handle network-specific logic
  }
}
```

**Error Classifications:**
- `NETWORK` - Connection issues
- `SERVER` - Backend errors (5xx)
- `AUTH` - Authentication failures (401)
- `NOT_FOUND` - Missing resources (404)
- `VALIDATION` - Invalid input (400)
- `PERMISSION` - Access denied (403)

**Built-in Messages:**
- 401: "Session Expired"
- 403: "Access Denied"
- 404: "Not Found"
- 429: "Too Many Requests"
- 500: "Server Error"
- 502/503/504: "Service Unavailable"

## Best Practices

### 1. Service Layer Error Handling

Always add context to errors in service functions:

```tsx
// Good ✅
export const fetchTracks = async () => {
  try {
    const response = await fetch('/api/tracks');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch tracks');
    }
    return await response.json();
  } catch (error: any) {
    error.userMessage = isNetworkError(error)
      ? "Unable to connect. Please check your internet connection."
      : error.message || 'Failed to load tracks';
    throw error;
  }
};

// Bad ❌
export const fetchTracks = async () => {
  const response = await fetch('/api/tracks');
  return await response.json(); // No error handling!
};
```

### 2. Component Error Display

Use appropriate error display based on context:

```tsx
// For critical errors that block entire page
<ErrorBoundary>
  <CriticalComponent />
</ErrorBoundary>

// For recoverable errors
function TrackList() {
  const { tracks, loading, error, refresh } = useTracks();
  
  if (error) {
    return (
      <ErrorMessage
        title="Loading Failed"
        message={error}
        onRetry={refresh}
      />
    );
  }
  
  if (loading) {
    return <LoadingSkeleton type="track" count={10} />;
  }
  
  return <TracksList tracks={tracks} />;
}
```

### 3. Toast Notifications

Use toasts for transient feedback, not critical errors:

```tsx
// Good uses ✅
showSuccess('Track added to favorites!');
showInfo('Uploading beat...');
showWarning('WhatsApp contact is required for beats');
showError('Upload failed. Please try again.');

// Bad uses ❌
showError('Critical database error occurred'); // Use ErrorBoundary
showSuccess('Page loaded successfully'); // Too obvious
```

### 4. Loading States

Show loading indicators for operations > 200ms:

```tsx
// Immediate feedback for quick actions
const [isSaving, setIsSaving] = useState(false);

const handleSave = async () => {
  setIsSaving(true);
  try {
    await saveData();
    showSuccess('Saved!');
  } finally {
    setIsSaving(false);
  }
};

// Skeleton screens for content loading
function ContentPage() {
  const { data, loading } = useContent();
  
  return (
    <div>
      {loading ? (
        <LoadingSkeleton type="card" count={6} />
      ) : (
        <Content data={data} />
      )}
    </div>
  );
}
```

### 5. Network Error Recovery

Implement retry logic for transient failures:

```tsx
import { getRetryDelay, shouldRetry } from '../utils/errorMessages';

async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      
      if (!shouldRetry(error, attempt)) {
        break;
      }
      
      const delay = getRetryDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

## Complete Example

Here's a complete example combining all features:

```tsx
'use client';

import { useState } from 'react';
import { useTracks } from '../hooks/useTracks';
import { useToast } from '../contexts/ToastContext';
import { LoadingOverlay, LoadingSkeleton, ErrorMessage } from '../components/LoadingStates';
import { isNetworkError, getRetryDelay } from '../utils/errorMessages';

export default function TracksPage() {
  const { tracks, loading, error, refresh } = useTracks();
  const { showSuccess, showError } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refresh();
      showSuccess('Tracks loaded successfully!');
    } catch (err: any) {
      if (isNetworkError(err)) {
        showError('Still unable to connect. Please check your internet.');
      } else {
        showError(err.userMessage || 'Failed to load tracks');
      }
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Initial loading overlay */}
      <LoadingOverlay show={loading && tracks.length === 0} message="Loading tracks..." />
      
      {/* Network status banner */}
      {!window.navigator?.onLine && (
        <div className="bg-yellow-500 text-white p-2 text-center">
          You're offline. Some features may not work.
        </div>
      )}
      
      {/* Error state */}
      {error && !loading ? (
        <ErrorMessage
          title="Loading Failed"
          message={error}
          suggestion="Please try again or check your internet connection"
          onRetry={handleRetry}
          showRetryButton={!isRetrying}
        />
      ) : loading ? (
        /* Loading state */
        <div className="grid grid-cols-4 gap-4 p-4">
          <LoadingSkeleton type="track" count={10} />
        </div>
      ) : (
        /* Success state */
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white mb-4">All Tracks</h1>
          <div className="grid grid-cols-4 gap-4">
            {tracks.map(track => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Testing in Development

To test error states in development:

```tsx
// Force network error
<button onClick={() => window.dispatchEvent(new Event('offline'))}>
  Simulate Offline
</button>

// Force server error
<button onClick={() => fetch('/api/test-error')}>
  Trigger Error
</button>

// Test loading states
const [testLoading, setTestLoading] = useState(true);
<LoadingSkeleton type="album" count={6} />
```

## Production Deployment

The error handling system is production-ready out of the box:

1. ✅ ErrorBoundary catches all React errors
2. ✅ Toast notifications provide user feedback
3. ✅ Network monitoring detects connectivity issues
4. ✅ User-friendly messages hide technical details
5. ✅ Retry logic handles transient failures
6. ✅ Loading states improve perceived performance

## Customization

### Change Error Messages

Edit `utils/errorMessages.ts`:

```tsx
export const getUserFriendlyError = (error: any, statusCode?: number): ErrorMessage => {
  // Customize default messages
  return {
    title: 'Custom Title',
    message: 'Your custom message here',
    suggestion: 'Helpful suggestion',
  };
};
```

### Style Toast Notifications

Modify `contexts/ToastContext.tsx`:

```tsx
const getToastStyles = (type: ToastMessage['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-600 border-green-500'; // Change colors
    // ...
  }
};
```

### Add New Skeleton Types

Extend `components/LoadingStates.tsx`:

```tsx
case 'profile':
  return (
    <div className="flex items-center gap-4 animate-pulse">
      <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );
```

## Summary

This error handling system ensures:
- 🎯 Clear, user-friendly error messages
- ⚡ Fast recovery with retry logic
- 🎨 Consistent loading states
- 🛡️ Crash prevention with ErrorBoundary
- 📱 Network awareness
- 🚀 Production-ready implementation

All errors are handled gracefully with helpful messages that guide users rather than showing technical jargon.
