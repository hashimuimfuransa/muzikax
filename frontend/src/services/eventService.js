// Helper function to refresh token
const refreshToken = async () => {
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
    }
    catch (error) {
        console.error('Error refreshing token:', error);
    }
    return null;
};
// Helper function to make authenticated request with token refresh
const makeAuthenticatedRequest = async (url, options = {}) => {
    let accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        throw new Error('No access token found');
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
    }
    return response;
};
/**
 * Fetch upcoming events
 */
export const fetchUpcomingEvents = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/upcoming`);
        if (!response.ok) {
            throw new Error(`Failed to fetch upcoming events: ${response.status} ${response.statusText}`);
        }
        const events = await response.json();
        return events;
    }
    catch (error) {
        console.error('Error fetching upcoming events:', error);
        throw error;
    }
};
