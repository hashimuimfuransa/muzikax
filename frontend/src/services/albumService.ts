// Define Album interface based on backend structure
interface Album {
  _id: string;
  id: string;
  title: string;
  description: string;
  genre: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
  } | string;
  coverURL: string;
  releaseDate: string;
  tracks: Array<any>;
  plays: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
}

// Define Track interface based on backend structure
interface Track {
  _id: string;
  creatorId: string;
  creatorType: 'artist' | 'dj' | 'producer';
  title: string;
  description: string;
  audioURL: string;
  coverURL: string;
  genre: string;
  type: 'song' | 'beat' | 'mix';
  paymentType?: 'free' | 'paid';
  plays: number;
  likes: number;
  comments: string[];
  createdAt: string;
  updatedAt: string;
  albumId?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create a new album
export const createAlbum = async (albumData: {
  title: string;
  description: string;
  genre: string;
  coverURL: string;
  trackIds: string[];
}): Promise<Album> => {
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
export const getAllAlbums = async (page: number = 1, limit: number = 10): Promise<{ albums: Album[], pagination: any }> => {
  const response = await fetch(`${API_BASE_URL}/api/albums?page=${page}&limit=${limit}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch albums');
  }
  
  return response.json();
};

// Get album by ID
export const getAlbumById = async (id: string): Promise<Album> => {
  const response = await fetch(`${API_BASE_URL}/api/albums/${id}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch album');
  }
  
  return response.json();
};

// Get albums by creator
export const getAlbumsByCreator = async (creatorId: string): Promise<Album[]> => {
  const response = await fetch(`${API_BASE_URL}/api/albums/creator/${creatorId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch creator albums');
  }
  
  return response.json();
};

// Update album
export const updateAlbum = async (id: string, albumData: Partial<Album>): Promise<Album> => {
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
export const deleteAlbum = async (id: string): Promise<void> => {
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
export const incrementAlbumPlayCount = async (id: string): Promise<number> => {
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