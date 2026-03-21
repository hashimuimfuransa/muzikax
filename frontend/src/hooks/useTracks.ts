import { useState, useEffect } from 'react';
import { ITrack } from '../types';
import { fetchAllTracks, fetchTrendingTracks, fetchPopularCreators, fetchTracksByType } from '../services/trackService';
import { isNetworkError } from '../utils/errorMessages';
import { useLoadingTimeout } from './useLoadingTimeout';

interface UseTracksResult {
  tracks: ITrack[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  total?: number;
  page?: number;
  pages?: number;
}

interface UseCreatorsResult {
  creators: any[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useAllTracks = (page: number = 1, limit: number = 10): UseTracksResult => {
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading, isTimedOut, dismissTimeout } = useLoadingTimeout({
    initialLoading: true,
    timeout: 30000, // 30 seconds timeout
    onTimeout: () => {
      console.warn('Loading tracks timed out after 30 seconds');
    },
  });

  const fetchTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllTracks(page, limit);
      setTracks(data.tracks);
      if (isTimedOut) dismissTimeout();
    } catch (err: any) {
      const errorMessage = err.userMessage || err.message || 'Failed to fetch tracks';
      setError(errorMessage);
      console.error('Error fetching tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [page, limit]);

  return { tracks, loading: isLoading, error, refresh: fetchTracks };
};

export const useTrendingTracks = (limit: number = 10, page: number = 1, sortBy?: 'plays' | 'likes' | 'newest' | 'recent'): UseTracksResult => {
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [pages, setPages] = useState<number>(0);
  const { isLoading, setLoading, isTimedOut, dismissTimeout } = useLoadingTimeout({
    initialLoading: true,
    timeout: 30000, // 30 seconds timeout
    onTimeout: () => {
      console.warn('Loading trending tracks timed out after 30 seconds');
    },
  });

  const fetchTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the dedicated trending tracks endpoint that filters out beats
      const trendingTracks = await fetchTrendingTracks(limit, sortBy);
      setTracks(trendingTracks);
      
      // For pagination info, we still need to call fetchAllTracks
      // but we only care about the metadata
      const paginationData = await fetchAllTracks(page, limit);
      setTotal(paginationData.total);
      setPages(paginationData.pages);
      if (isTimedOut) dismissTimeout();
    } catch (err: any) {
      const errorMessage = err.userMessage || err.message || 'Failed to fetch trending tracks';
      setError(errorMessage);
      console.error('Error fetching trending tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [limit, page, sortBy]);

  return { tracks, loading: isLoading, error, refresh: fetchTracks, total, page, pages };
};

export const usePopularCreators = (limit: number = 10): UseCreatorsResult => {
  const [creators, setCreators] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading, isTimedOut, dismissTimeout } = useLoadingTimeout({
    initialLoading: true,
    timeout: 30000, // 30 seconds timeout
    onTimeout: () => {
      console.warn('Loading popular creators timed out after 30 seconds');
    },
  });

  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPopularCreators(limit);
      setCreators(data);
      if (isTimedOut) dismissTimeout();
    } catch (err: any) {
      const errorMessage = err.userMessage || err.message || 'Failed to fetch popular creators';
      setError(errorMessage);
      console.error('Error fetching popular creators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreators();
  }, [limit]);

  return { creators, loading: isLoading, error, refresh: fetchCreators };
};

export const useTracksByType = (type: string, limit: number = 10): UseTracksResult => {
  const [tracks, setTracks] = useState<ITrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, setLoading, isTimedOut, dismissTimeout } = useLoadingTimeout({
    initialLoading: true,
    timeout: 30000, // 30 seconds timeout
    onTimeout: () => {
      console.warn(`Loading ${type} tracks timed out after 30 seconds`);
    },
  });

  const fetchTracks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTracksByType(type, limit);
      setTracks(data);
      if (isTimedOut) dismissTimeout();
    } catch (err: any) {
      const errorMessage = err.userMessage || err.message || `Failed to fetch ${type} tracks`;
      setError(errorMessage);
      console.error(`Error fetching ${type} tracks:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracks();
  }, [type, limit]);

  return { tracks, loading: isLoading, error, refresh: fetchTracks };
};