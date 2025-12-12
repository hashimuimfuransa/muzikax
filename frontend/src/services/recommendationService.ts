import { ITrack } from '../types';

// Helper function to refresh token
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return null;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return data.accessToken;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
  }
  return null;
};

// Helper function to make authenticated request with token refresh
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let accessToken = localStorage.getItem('accessToken');
  
  if (!accessToken) {
    throw new Error('No access token found');
  }

  // Add authorization header to options
  const requestOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  };

  // Make initial request
  let response = await fetch(url, requestOptions);

  // If token is expired, try to refresh it
  if (response.status === 401) {
    console.log('Token might be expired, attempting to refresh...');
    const newToken = await refreshToken();
    
    if (newToken) {
      // Retry the request with new token
      requestOptions.headers = {
        ...requestOptions.headers,
        'Authorization': `Bearer ${newToken}`
      };
      
      response = await fetch(url, requestOptions);
    }
  }

  return response;
};

/**
 * Fetch recommended tracks based on user preferences and listening history
 * This implements an addictive recommendation algorithm targeting category and niche
 */
export const fetchRecommendedTracks = async (currentTrackId?: string, limit: number = 5): Promise<ITrack[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (currentTrackId) {
      params.append('excludeTrackId', currentTrackId);
    }

    // First, try to get personalized recommendations if user is logged in
    let accessToken = localStorage.getItem('accessToken');
    
    if (accessToken) {
      try {
        // Try to get recommendations based on user's recently played tracks
        const response = await makeAuthenticatedRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/personalized?${params.toString()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          return data.tracks || [];
        }
      } catch (authError) {
        console.warn('Could not fetch personalized recommendations:', authError);
      }
    }
    
    // Fallback to general recommendations based on popular tracks
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/general?${params.toString()}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recommendations: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Error fetching recommended tracks:', error);
    throw error;
  }
};

/**
 * Get recommendations based on a specific track (similar tracks)
 */
export const fetchSimilarTracks = async (trackId: string, limit: number = 5): Promise<ITrack[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/similar/${trackId}?limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch similar tracks: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.tracks || [];
  } catch (error) {
    console.error('Error fetching similar tracks:', error);
    throw error;
  }
};