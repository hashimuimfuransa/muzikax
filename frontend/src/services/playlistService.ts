/**
 * Service for creating and managing premade playlists
 */

import { ITrack } from '../types';

export interface PremadePlaylist {
  id: string;
  name: string;
  description: string;
  tracks: ITrack[];
  genre?: string;
  location?: string;
  createdAt: Date;
}

export interface UserLocation {
  country: string;
  region?: string;
  city?: string;
}

/**
 * Get user's location for location-based playlists
 */
export const getUserLocation = async (): Promise<UserLocation> => {
  try {
    if (navigator.geolocation) {
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            
            // Use a reverse geocoding service to get location details
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
              );
              const data = await response.json();
              
              const location: UserLocation = {
                country: data.countryCode || 'Global',
                region: data.principalSubdivision || '',
                city: data.locality || ''
              };
              
              resolve(location);
            } catch (geoError) {
              console.error('Error getting location details:', geoError);
              resolve({ country: 'Global' });
            }
          },
          () => resolve({ country: 'Global' }), // If location permission denied
          { timeout: 5000, enableHighAccuracy: true }
        );
      });
    }
    return { country: 'Global' };
  } catch (error) {
    console.error('Error getting user location:', error);
    return { country: 'Global' };
  }
};

/**
 * Get tracks by location if available in the track data
 */
const getTracksByLocation = (tracks: ITrack[], location: string): ITrack[] => {
  return tracks.filter(track => 
    track.location && 
    track.location.toLowerCase().includes(location.toLowerCase())
  );
};

/**
 * Create premade playlists based on genres
 */
export const createGenreBasedPlaylists = async (tracks: ITrack[]): Promise<PremadePlaylist[]> => {
  // Group tracks by genre
  const genreMap: Record<string, ITrack[]> = {};
  
  tracks.forEach(track => {
    const genre = track.genre || 'Unknown';
    if (!genreMap[genre]) {
      genreMap[genre] = [];
    }
    genreMap[genre].push(track);
  });
  
  // Create playlists for each genre (top 20 tracks per genre)
  const playlists: PremadePlaylist[] = [];
  
  for (const [genre, genreTracks] of Object.entries(genreMap)) {
    // Sort tracks by play count or like count
    const sortedTracks = [...genreTracks].sort((a, b) => {
      const bPlays = b.plays || 0;
      const aPlays = a.plays || 0;
      return bPlays - aPlays;
    });
    
    // Take top 20 tracks
    const topTracks = sortedTracks.slice(0, 20);
    
    playlists.push({
      id: `genre-${genre.toLowerCase().replace(/\s+/g, '-')}`,
      name: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Hits`,
      description: `Popular ${genre} tracks curated for you`,
      tracks: topTracks,
      genre: genre,
      createdAt: new Date()
    });
  }
  
  return playlists;
};

/**
 * Create location-based playlists
 */
export const createLocationBasedPlaylists = async (
  tracks: ITrack[],
  userLocation: UserLocation
): Promise<PremadePlaylist[]> => {
  const playlists: PremadePlaylist[] = [];
  
  // Find tracks from the user's country if location data is available
  const countryTracks = getTracksByLocation(tracks, userLocation.country);
  
  if (countryTracks.length > 0) {
    // Sort by play count
    const sortedCountryTracks = [...countryTracks].sort((a, b) => {
      const bPlays = b.plays || 0;
      const aPlays = a.plays || 0;
      return bPlays - aPlays;
    });
    
    // Create a playlist with top tracks from user's country
    playlists.push({
      id: `location-${userLocation.country.toLowerCase()}`,
      name: `Made in ${userLocation.country}`,
      description: `Popular tracks from ${userLocation.country}`,
      tracks: sortedCountryTracks.slice(0, 20),
      location: userLocation.country,
      createdAt: new Date()
    });
  }
  
  // Create a global hits playlist as fallback
  const globalTracks = [...tracks]
    .sort((a, b) => {
      const bPlays = b.plays || 0;
      const aPlays = a.plays || 0;
      return bPlays - aPlays;
    })
    .slice(0, 20);
  
  playlists.push({
    id: 'global-hits',
    name: 'Global Hits',
    description: 'Top tracks from around the world',
    tracks: globalTracks,
    createdAt: new Date()
  });
  
  return playlists;
};

/**
 * Create mood-based playlists
 */
export const createMoodBasedPlaylists = (tracks: ITrack[]): PremadePlaylist[] => {
  const playlists: PremadePlaylist[] = [];
  
  // Energy-based playlists
  const highEnergyTracks = tracks
    .filter(track => {
      // In a real implementation, we'd analyze audio features
      // For now, we'll use a heuristic based on play count and genre
      return (track.plays || 0) > 1000 && 
             (track.genre === 'rock' || track.genre === 'electronic' || track.genre === 'hip-hop');
    })
    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
    .slice(0, 15);
  
  if (highEnergyTracks.length > 0) {
    playlists.push({
      id: 'high-energy',
      name: 'High Energy',
      description: 'Upbeat tracks to boost your energy',
      tracks: highEnergyTracks,
      createdAt: new Date()
    });
  }
  
  const chillTracks = tracks
    .filter(track => {
      // Heuristic for chill tracks
      return (track.genre === 'lo-fi' || track.genre === 'chill' || track.genre === 'ambient');
    })
    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
    .slice(0, 15);
  
  if (chillTracks.length > 0) {
    playlists.push({
      id: 'chill-vibes',
      name: 'Chill Vibes',
      description: 'Relaxing tracks for a calm atmosphere',
      tracks: chillTracks,
      createdAt: new Date()
    });
  }
  
  return playlists;
};

/**
 * Create decade-based playlists
 */
export const createDecadeBasedPlaylists = (tracks: ITrack[]): PremadePlaylist[] => {
  const playlists: PremadePlaylist[] = [];
  
  // Group tracks by release year (using createdAt as approximation)
  const yearMap: Record<string, ITrack[]> = {};
  
  tracks.forEach(track => {
    const year = new Date(track.createdAt).getFullYear().toString();
    const decade = `${Math.floor(parseInt(year) / 10) * 10}s`; // e.g., "2020s"
    
    if (!yearMap[decade]) {
      yearMap[decade] = [];
    }
    yearMap[decade].push(track);
  });
  
  // Create playlists for each decade with popular tracks
  for (const [decade, decadeTracks] of Object.entries(yearMap)) {
    const sortedTracks = [...decadeTracks].sort((a, b) => {
      const bPlays = b.plays || 0;
      const aPlays = a.plays || 0;
      return bPlays - aPlays;
    });
    
    if (sortedTracks.length > 0) {
      playlists.push({
        id: `decade-${decade.toLowerCase()}`,
        name: `${decade} Hits`,
        description: `Popular tracks from the ${decade}`,
        tracks: sortedTracks.slice(0, 15),
        createdAt: new Date()
      });
    }
  }
  
  return playlists;
};

/**
 * Get all premade playlists
 */
export const getAllPremadePlaylists = async (tracks: ITrack[]): Promise<PremadePlaylist[]> => {
  const userLocation = await getUserLocation();
  
  const genrePlaylists = await createGenreBasedPlaylists(tracks);
  const locationPlaylists = await createLocationBasedPlaylists(tracks, userLocation);
  const moodPlaylists = createMoodBasedPlaylists(tracks);
  const decadePlaylists = createDecadeBasedPlaylists(tracks);
  
  // Combine all playlists
  const allPlaylists = [
    ...genrePlaylists,
    ...locationPlaylists,
    ...moodPlaylists,
    ...decadePlaylists
  ];
  
  // Remove duplicates by ID
  const uniquePlaylists = allPlaylists.filter(
    (playlist, index, self) => 
      index === self.findIndex(p => p.id === playlist.id)
  );
  
  return uniquePlaylists;
};

/**
 * Get featured playlists (a selection of the best premade playlists)
 */
export const getFeaturedPlaylists = async (tracks: ITrack[]): Promise<PremadePlaylist[]> => {
  const allPlaylists = await getAllPremadePlaylists(tracks);
  
  // Select featured playlists (top genre, location, mood, and decade-based)
  const featured: PremadePlaylist[] = [];
  
  // Add one genre playlist
  const genrePlaylist = allPlaylists.find(p => p.genre && !p.location);
  if (genrePlaylist) {
    featured.push(genrePlaylist);
  }
  
  // Add location playlist
  const locationPlaylist = allPlaylists.find(p => p.location);
  if (locationPlaylist) {
    featured.push(locationPlaylist);
  }
  
  // Add mood playlist
  const moodPlaylist = allPlaylists.find(p => !p.genre && !p.location && p.name.includes('Energy'));
  if (moodPlaylist) {
    featured.push(moodPlaylist);
  }
  
  // Add decade playlist
  const decadePlaylist = allPlaylists.find(p => p.name.includes('s Hits')); // Decade playlists have "s Hits" in the name
  if (decadePlaylist && !featured.some(p => p.id === decadePlaylist.id)) {
    featured.push(decadePlaylist);
  }
  
  // Add global hits if not already included
  const globalHits = allPlaylists.find(p => p.id === 'global-hits');
  if (globalHits && !featured.some(p => p.id === 'global-hits')) {
    featured.push(globalHits);
  }
  
  return featured;
};

/**
 * Save user's selected premade playlist to their account
 */
export const savePremadePlaylistToUser = async (
  playlistId: string,
  playlistName: string,
  tracks: ITrack[]
): Promise<boolean> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('User not authenticated');
    }
    
    // Call the backend API to save the playlist
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        name: playlistName,
        trackIds: tracks.map(track => track._id)
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save playlist: ${response.status} ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving premade playlist:', error);
    return false;
  }
};

/**
 * Get user's saved premade playlists
 */
export const getUserPremadePlaylists = async (): Promise<PremadePlaylist[]> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('User not authenticated');
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists/user`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch user playlists: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert the backend playlist format to our PremadePlaylist format
    return data.playlists.map((playlist: any) => ({
      id: playlist._id,
      name: playlist.name,
      description: playlist.description || `Playlist with ${playlist.tracks.length} tracks`,
      tracks: playlist.tracks,
      createdAt: new Date(playlist.createdAt)
    }));
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    return [];
  }
};