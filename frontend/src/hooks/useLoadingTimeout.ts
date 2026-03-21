'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseLoadingTimeoutOptions {
  initialLoading?: boolean;
  timeout?: number; // Timeout in milliseconds
  onTimeout?: () => void;
}

interface UseLoadingTimeoutResult {
  isLoading: boolean;
  isTimedOut: boolean;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  dismissTimeout: () => void;
}

/**
 * Custom hook for managing loading state with timeout
 * @param options - Configuration options
 * @returns Loading state management functions
 */
export const useLoadingTimeout = ({
  initialLoading = false,
  timeout,
  onTimeout,
}: UseLoadingTimeoutOptions = {}): UseLoadingTimeoutResult => {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const reset = useCallback(() => {
    setIsLoading(false);
    setIsTimedOut(false);
  }, []);

  const dismissTimeout = useCallback(() => {
    setIsTimedOut(false);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsTimedOut(false);
    setIsLoading(loading);
  }, []);

  useEffect(() => {
    if (!isLoading || !timeout) return;

    const timer = setTimeout(() => {
      setIsTimedOut(true);
      if (onTimeout) {
        onTimeout();
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, timeout, onTimeout]);

  return {
    isLoading,
    isTimedOut,
    setLoading,
    reset,
    dismissTimeout,
  };
};

export default useLoadingTimeout;
