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
 * Get user's location for location-based recommendations
 */
const getUserLocation = async (): Promise<string | null> => {
  try {
    // Try to get location from Geolocation API
    if (navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Use a reverse geocoding service to get location name
            fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
              .then(response => response.json())
              .then(data => {
                const country = data.countryCode || 'global';
                resolve(country);
              })
              .catch(() => resolve('global'));
          },
          () => resolve('global'), // If location permission denied, default to global
          { timeout: 5000 }
        );
      });
    }
    return 'global';
  } catch (error) {
    console.error('Error getting user location:', error);
    return 'global';
  }
};

/**
 * Fetch ML-powered recommended tracks based on user preferences and listening history
 * This implements an advanced ML recommendation algorithm with genre, location, and behavior factors
 */
export const fetchRecommendedTracks = async (currentTrackId?: string, limit: number = 10, sortBy: 'popular' | 'recent' | 'views' = 'recent'): Promise<ITrack[]> => {
  try {
    // Get user location for location-based recommendations
    const userLocation = await getUserLocation();
    
    // Build query parameters for ML API
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('sortBy', sortBy); // Use the specified sort option
    
    if (currentTrackId) {
      params.append('currentTrackId', currentTrackId);
    }

    // Get user ID if logged in
    const accessToken = localStorage.getItem('accessToken');
    let userId = null;
    if (accessToken) {
      try {
        // Decode JWT to get user ID
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          userId = payload.userId || payload.sub;
        }
      } catch (error) {
        console.warn('Could not decode user token:', error);
      }
    }

    // Build ML API URL - now goes through Node.js backend which handles Python integration with fallback
    let mlApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/ml-recommendations/personalized?${params.toString()}`;
    if (userId) {
      mlApiUrl += `&userId=${userId}`;
    }
    if (userLocation) {
      mlApiUrl += `&location=${encodeURIComponent(userLocation)}`;
    }

    // Try to get ML-powered recommendations
    try {
      const mlResponse = await fetch(mlApiUrl);
      
      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        console.log('ML recommendations received:', mlData.count, 'tracks');
        return mlData.tracks || [];
      } else if (mlResponse.status === 503) {
        // Python ML service unavailable, use fallback
        const errorData = await mlResponse.json();
        if (errorData.fallback) {
          console.log('Python ML service unavailable, falling back to traditional recommendations');
        } else {
          console.warn('ML API failed, falling back to traditional recommendations:', mlResponse.status);
        }
      } else {
        console.warn('ML API failed, falling back to traditional recommendations:', mlResponse.status);
      }
    } catch (mlError) {
      console.warn('ML API error, falling back to traditional recommendations:', mlError);
    }

    // Fallback to traditional recommendations if ML API fails
    if (accessToken) {
      try {
        // Try to get traditional personalized recommendations if user is logged in
        // Update the limit in params to ensure we get more than 5 tracks
        const personalizedParams = new URLSearchParams(params);
        personalizedParams.set('limit', limit.toString());
        personalizedParams.set('sortBy', sortBy); // Use the specified sort option
        
        const response = await makeAuthenticatedRequest(
          `${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/personalized?${personalizedParams.toString()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          return data.tracks || [];
        }
      } catch (authError) {
        console.warn('Could not fetch traditional personalized recommendations:', authError);
      }
    }
    
    // Final fallback to general recommendations based on popular tracks
    // Update the limit in params to ensure we get more than 5 tracks
    const fallbackParams = new URLSearchParams(params);
    fallbackParams.set('limit', limit.toString());
    fallbackParams.set('sortBy', sortBy); // Use the specified sort option
    // Exclude beats from general recommendations
    fallbackParams.set('excludeType', 'beat');
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/general?${fallbackParams.toString()}`
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
export const fetchSimilarTracks = async (trackId: string, limit: number = 10, sortBy: 'popular' | 'recent' | 'views' = 'recent'): Promise<ITrack[]> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/similar/${trackId}?limit=${limit}&sortBy=${sortBy}`
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