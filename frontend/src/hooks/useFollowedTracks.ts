import { useState, useEffect } from 'react';
import { fetchTracksFromFollowedArtists } from '../services/trackService';

export const useFollowedTracks = (limit: number = 20) => {
    const [tracks, setTracks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFollowedTracks = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching tracks from followed artists...');
            const data = await fetchTracksFromFollowedArtists(limit);
            console.log('Received followed tracks:', data.length, 'tracks');
            console.log('Sample track:', data[0]);
            setTracks(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tracks from followed artists');
            console.error('Error fetching tracks from followed artists:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFollowedTracks();
    }, [limit]);

    return { tracks, loading, error, refresh: fetchFollowedTracks };
};
