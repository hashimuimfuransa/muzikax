const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Create a new album
export const createAlbum = async (albumData) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('No authentication token found');
    }
    const response = await fetch(`${API_BASE_URL}/api/albums`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(albumData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create album');
    }
    return response.json();
};
// Get all albums
export const getAllAlbums = async (page = 1, limit = 10) => {
    const response = await fetch(`${API_BASE_URL}/api/albums?page=${page}&limit=${limit}`);
    if (!response.ok) {
        throw new Error('Failed to fetch albums');
    }
    return response.json();
};
// Get album by ID
export const getAlbumById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/albums/${id}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch album');
    }
    return response.json();
};
// Get albums by creator
export const getAlbumsByCreator = async (creatorId) => {
    const response = await fetch(`${API_BASE_URL}/api/albums/creator/${creatorId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch creator albums');
    }
    return response.json();
};
// Update album
export const updateAlbum = async (id, albumData) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('No authentication token found');
    }
    const response = await fetch(`${API_BASE_URL}/api/albums/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(albumData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update album');
    }
    return response.json();
};
// Delete album
export const deleteAlbum = async (id) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('No authentication token found');
    }
    const response = await fetch(`${API_BASE_URL}/api/albums/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete album');
    }
};
// Increment album play count
export const incrementAlbumPlayCount = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/albums/${id}/play`, {
        method: 'PUT'
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to increment play count');
    }
    const data = await response.json();
    return data.plays;
};
