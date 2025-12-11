import { ITrack } from '../types';

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
 * Fetch all tracks with pagination
 */
export const fetchAllTracks = async (page: number = 1, limit: number = 10): Promise<PaginatedTracks> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks?limit=${limit}&page=${page}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tracks: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching tracks:', error);
    throw error;
  }
};

/**
 * Fetch trending tracks
 */
export const fetchTrendingTracks = async (limit: number = 10): Promise<ITrack[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/trending?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch trending tracks: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching trending tracks:', error);
    throw error;
  }
};

/**
 * Fetch a single track by ID
 */
export const fetchTrackById = async (id: string): Promise<ITrack> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch track: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching track:', error);
    throw error;
  }
};

/**
 * Fetch tracks by creator ID (public endpoint)
 */
export const fetchTracksByCreatorPublic = async (creatorId: string): Promise<any[]> => {
  try {
    // Use the new simple public endpoint that doesn't require authentication
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/creator/${creatorId}/simple`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch creator tracks: ${response.status} ${response.statusText}`);
    }

    const tracks = await response.json();
    
    // Map the fields to match the Track interface used in the frontend
    return tracks.map((track: any) => ({
      ...track,
      audioUrl: track.audioURL || '',
      coverArt: track.coverURL || '',
      artist: track.creatorId?.name || 'Unknown Artist',
      duration: track.duration || 0
    }));
  } catch (error) {
    console.error('Error fetching creator tracks:', error);
    throw error;
  }
};

/**
 * Fetch tracks by creator ID
 */
export const fetchTracksByCreator = async (creatorId: string, page: number = 1, limit: number = 10): Promise<PaginatedTracks> => {
  try {
    // This endpoint might require authentication depending on privacy settings
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks/creator/${creatorId}?limit=${limit}&page=${page}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch creator tracks: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching creator tracks:', error);
    throw error;
  }
};

/**
 * Fetch popular creators (users with role 'creator')
 */
export const fetchPopularCreators = async (limit: number = 10): Promise<any[]> => {
  try {
    // Use the new public creators endpoint that doesn't require any authentication
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/creators?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular creators: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.users;
  } catch (error) {
    console.error('Error fetching popular creators:', error);
    throw error;
  }
};