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
 * Add track to recently played
 */
export const addRecentlyPlayed = async (trackId: string): Promise<boolean> => {
  try {
    const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/recently-played`, {
      method: 'POST',
      body: JSON.stringify({ trackId })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add track to recently played');
    }

    return true;
  } catch (error) {
    console.error('Error adding track to recently played:', error);
    throw error;
  }
};

/**
 * Get user's recently played tracks
 */
export const getRecentlyPlayed = async (): Promise<any[]> => {
  try {
    const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/recently-played`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch recently played tracks');
    }

    const data = await response.json();
    return data.tracks;
  } catch (error) {
    console.error('Error fetching recently played tracks:', error);
    throw error;
  }
};