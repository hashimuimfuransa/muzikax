'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { dataPreloaderService, PreloadedData } from '@/services/dataPreloader';

interface PreloadContextType {
  data: PreloadedData | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const PreloadContext = createContext<PreloadContextType | undefined>(undefined);

export function PreloadProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PreloadedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Get current preloaded data
    const currentData = dataPreloaderService.getData();
    
    if (currentData.isReady) {
      setData(currentData);
      setIsReady(true);
      setIsLoading(false);
      console.log('✅ Using already preloaded data');
    } else {
      // Wait for preload to complete
      const unsubscribe = dataPreloaderService.subscribe(() => {
        const updatedData = dataPreloaderService.getData();
        setData(updatedData);
        setIsLoading(updatedData.isLoading);
        setIsReady(updatedData.isReady);
        setError(updatedData.error);
        
        if (updatedData.isReady || updatedData.error) {
          unsubscribe();
        }
      });

      // Initial state
      setData(currentData);
      setIsLoading(currentData.isLoading);
      setIsReady(currentData.isReady);
      setError(currentData.error);
    }
  }, []);

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const refreshedData = await dataPreloaderService.reloadData();
      setData(refreshedData);
      setIsReady(refreshedData.isReady);
      setError(refreshedData.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PreloadContext.Provider value={{ data, isLoading, isReady, error, refreshData }}>
      {children}
    </PreloadContext.Provider>
  );
}

export function usePreload() {
  const context = useContext(PreloadContext);
  if (context === undefined) {
    throw new Error('usePreload must be used within a PreloadProvider');
  }
  return context;
}
