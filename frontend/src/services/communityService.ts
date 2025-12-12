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
 * Fetch community members (creators) from the backend
 */
export const fetchCommunityMembers = async (): Promise<any[]> => {
  try {
    // Fetch popular creators from the public endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/creators?limit=20`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch community members: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error('Error fetching community members:', error);
    throw error;
  }
};

/**
 * Fetch community statistics
 */
export const fetchCommunityStats = async (): Promise<{ members: number; posts: number; events: number }> => {
  try {
    // For now, we'll fetch the creators count as community members
    const membersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/public/creators?limit=100`);
    
    if (!membersResponse.ok) {
      throw new Error(`Failed to fetch community stats: ${membersResponse.status} ${membersResponse.statusText}`);
    }

    const membersData = await membersResponse.json();
    const memberCount = membersData.users ? membersData.users.length : 0;
    
    // These are placeholder values since we don't have real endpoints for posts and events yet
    return {
      members: memberCount,
      posts: 1248, // Placeholder value
      events: 12  // Placeholder value
    };
  } catch (error) {
    console.error('Error fetching community stats:', error);
    throw error;
  }
};

/**
 * Follow a creator
 */
export const followCreator = async (creatorId: string): Promise<{ success: boolean; followersCount: number }> => {
  try {
    const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/users/follow/${creatorId}`, {
      method: 'POST'
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to follow creator');
    }

    const data = await response.json();
    return {
      success: true,
      followersCount: data.followersCount
    };
  } catch (error) {
    console.error('Error following creator:', error);
    throw error;
  }
};

/**
 * Unfollow a creator
 */
export const unfollowCreator = async (creatorId: string): Promise<{ success: boolean }> => {
  try {
    // Note: We don't have an unfollow endpoint in the backend yet
    // For now, we'll simulate the action
    console.warn('Unfollow functionality not implemented in backend yet');
    return { success: true };
  } catch (error) {
    console.error('Error unfollowing creator:', error);
    throw error;
  }
};