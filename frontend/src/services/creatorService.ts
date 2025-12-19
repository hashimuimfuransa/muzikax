import { ITrack } from '../types/index';

export interface CreatorAnalytics {
  totalTracks: number;
  totalPlays: number;
  totalLikes: number;
  tracks: number;
  topCountries?: Array<{ country: string; count: number }>;
}

export interface PaginatedTracks {
  tracks: ITrack[];
  page: number;
  pages: number;
  total: number;
}

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
 * Fetch creator analytics data
 */
export const fetchCreatorAnalytics = async (): Promise<CreatorAnalytics> => {
  try {
    console.log('Fetching creator analytics...');
    
    // Use the new creator-specific endpoint with token refresh handling
    const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/creator/analytics`, {
      method: 'GET'
    });

    console.log('Analytics API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Analytics API error response:', errorText);
      throw new Error(`Failed to fetch creator analytics: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Analytics data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching creator analytics:', error);
    throw error;
  }
};

/**
 * Fetch creator tracks
 */
export const fetchCreatorTracks = async (page: number = 1, limit: number = 10): Promise<PaginatedTracks> => {
  try {
    console.log('Fetching creator tracks...');
    
    // Use the new creator-specific endpoint with token refresh handling
    const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/creator/tracks?limit=${limit}&page=${page}`, {
      method: 'GET'
    });

    console.log('Tracks API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Tracks API error response:', errorText);
      throw new Error(`Failed to fetch creator tracks: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Tracks data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching creator tracks:', error);
    throw error;
  }
};