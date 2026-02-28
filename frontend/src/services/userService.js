// Helper function to refresh token
// Use a module-level variable to track refresh attempts and avoid race conditions
let refreshPromise = null;

const refreshToken = async () => {
    // If a refresh is already in progress, wait for it
    if (refreshPromise) {
        return await refreshPromise;
    }

    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken) {
        // Clear user data if no refresh token is available
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        return null;
    }

    // Create a new refresh promise
    refreshPromise = (async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken: currentRefreshToken })
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);
                return data.accessToken;
            }
            else {
                // If refresh token is invalid, clear user data
                localStorage.removeItem('user');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                return null;
            }
        }
        catch (error) {
            console.error('Error refreshing token:', error);
            // Clear user data on refresh error
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return await refreshPromise;
};
// Helper function to make authenticated request with token refresh
const makeAuthenticatedRequest = async (url, options = {}) => {
    let accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        // Instead of throwing an error, return a response object with status 401
        // This allows calling functions to handle the lack of authentication gracefully
        return new Response(JSON.stringify({ message: 'No access token found' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    // Add authorization header to options
    const requestOptions = Object.assign(Object.assign({}, options), { headers: Object.assign(Object.assign({}, options.headers), { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` }) });
    // Make initial request
    let response = await fetch(url, requestOptions);
    // If token is expired, try to refresh it
    if (response.status === 401) {
        console.log('Token might be expired, attempting to refresh...');
        const newToken = await refreshToken();
        if (newToken) {
            // Retry the request with new token
            requestOptions.headers = Object.assign(Object.assign({}, requestOptions.headers), { 'Authorization': `Bearer ${newToken}` });
            response = await fetch(url, requestOptions);
        }
        else {
            // If token refresh failed, redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    }
    return response;
};
/**
 * Add track to user's favorites
 */
export const addTrackToFavorites = async (trackId) => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
            method: 'POST',
            body: JSON.stringify({ trackId })
        });
        // If user is not authenticated (401), return null
        if (response.status === 401) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add track to favorites');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error adding track to favorites:', error);
        return null;
    }
};
/**
 * Remove track from user's favorites
 */
export const removeTrackFromFavorites = async (trackId) => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`, {
            method: 'DELETE',
            body: JSON.stringify({ trackId })
        });
        // If user is not authenticated (401), return null
        if (response.status === 401) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove track from favorites');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error removing track from favorites:', error);
        return null;
    }
};
/**
 * Get user's favorite tracks
 */
export const getUserFavorites = async () => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/favorites`);
        // If user is not authenticated (401), return empty array
        if (response.status === 401) {
            return [];
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch favorites');
        }
        const data = await response.json();
        return data.favorites;
    }
    catch (error) {
        console.error('Error fetching favorites:', error);
        // Return empty array instead of throwing error to prevent app crashes
        return [];
    }
};
/**
 * Create a new playlist
 */
export const createPlaylist = async (name, description = '', isPublic = true, trackIds = []) => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists`, {
            method: 'POST',
            body: JSON.stringify({ name, description, isPublic, trackIds })
        });
        // If user is not authenticated (401), return null
        if (response.status === 401) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create playlist');
        }
        const data = await response.json();
        return data.playlist;
    }
    catch (error) {
        console.error('Error creating playlist:', error);
        return null;
    }
};
/**
 * Add track to playlist
 */
export const addTrackToPlaylist = async (playlistId, trackId) => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists/add-track`, {
            method: 'POST',
            body: JSON.stringify({ playlistId, trackId })
        });
        // If user is not authenticated (401), return null
        if (response.status === 401) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add track to playlist');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error adding track to playlist:', error);
        return null;
    }
};
/**
 * Get user's playlists
 */
export const getUserPlaylists = async () => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists`);
        // If user is not authenticated (401), return empty array
        if (response.status === 401) {
            return [];
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch playlists');
        }
        const data = await response.json();
        return data.playlists;
    }
    catch (error) {
        console.error('Error fetching playlists:', error);
        // Return empty array instead of throwing error to prevent app crashes
        return [];
    }
};

/**
 * Delete a playlist
 */
export const deletePlaylist = async (playlistId) => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists/${playlistId}`, {
            method: 'DELETE'
        });
        // If user is not authenticated (401), return null
        if (response.status === 401) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete playlist');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error deleting playlist:', error);
        return null;
    }
};

/**
 * Update a playlist tracks
 */
export const updatePlaylist = async (playlistId, trackIds, action = 'replace') => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists/update`, {
            method: 'PUT',
            body: JSON.stringify({ playlistId, trackIds, action })
        });
        // If user is not authenticated (401), return null
        if (response.status === 401) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update playlist');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error updating playlist:', error);
        return null;
    }
};

/**
 * Update playlist metadata
 */
export const updatePlaylistMetadata = async (playlistId, name, description, isPublic) => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists/${playlistId}`, {
            method: 'PATCH',
            body: JSON.stringify({ name, description, isPublic })
        });
        // If user is not authenticated (401), return null
        if (response.status === 401) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update playlist metadata');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error updating playlist metadata:', error);
        return null;
    }
};
/**
 * Update user profile
 */
export const updateUserProfile = async (profileData) => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/profile/me`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        // If user is not authenticated (401), return null
        if (response.status === 401) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update profile');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error updating profile:', error);
        return null;
    }
};
/**
 * Update user's WhatsApp contact
 */
export const updateUserWhatsAppContact = async (whatsappContact) => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/contact`, {
            method: 'PUT',
            body: JSON.stringify({ whatsappContact })
        });
        // If user is not authenticated (401), return null
        if (response.status === 401) {
            return null;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update WhatsApp contact');
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error updating WhatsApp contact:', error);
        return null;
    }
};
/**
 * Get user's WhatsApp contact
 */
export const getUserWhatsAppContact = async () => {
    try {
        const response = await makeAuthenticatedRequest(`${process.env.NEXT_PUBLIC_API_URL}/api/whatsapp/contact`, {
            method: 'GET'
        });
        // If user is not authenticated (401), return empty string
        if (response.status === 401) {
            return '';
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch WhatsApp contact');
        }
        const data = await response.json();
        return data.whatsappContact || '';
    }
    catch (error) {
        console.error('Error fetching WhatsApp contact:', error);
        return '';
    }
};
