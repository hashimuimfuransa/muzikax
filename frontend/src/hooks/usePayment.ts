'use client'

import { useState, useEffect } from 'react'

interface PaymentStatus {
  isPurchased: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UsePaymentReturn {
  checkPaymentStatus: (trackId: string) => Promise<boolean>;
  paymentStatus: Record<string, PaymentStatus>;
  purchaseTrack: (trackId: string, phoneNumber: string, amount: number) => Promise<boolean>;
  clearPaymentCache: (trackId: string) => void;
}

export const usePayment = (): UsePaymentReturn => {
  const [paymentStatus, setPaymentStatus] = useState<Record<string, PaymentStatus>>({});

  // Check if user has purchased a track
  const checkPaymentStatus = async (trackId: string): Promise<boolean> => {
    // If we already checked this track, return cached result
    if (paymentStatus[trackId]?.isPurchased !== undefined) {
      return paymentStatus[trackId].isPurchased;
    }

    // Set loading state
    setPaymentStatus(prev => ({
      ...prev,
      [trackId]: { isPurchased: false, isLoading: true, error: null }
    }));

    try {
      const response = await fetch(`/api/payments/history?trackId=${trackId}&status=completed`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const isPurchased = data.payments && data.payments.length > 0;
        
        setPaymentStatus(prev => ({
          ...prev,
          [trackId]: { isPurchased, isLoading: false, error: null }
        }));
        
        return isPurchased;
      } else {
        setPaymentStatus(prev => ({
          ...prev,
          [trackId]: { isPurchased: false, isLoading: false, error: 'Failed to check payment status' }
        }));
        return false;
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus(prev => ({
        ...prev,
        [trackId]: { isPurchased: false, isLoading: false, error: 'Network error' }
      }));
      return false;
    }
  };

  // Purchase a track via MTN MoMo
  const purchaseTrack = async (trackId: string, phoneNumber: string, amount: number): Promise<boolean> => {
    try {
      const response = await fetch('/api/payments/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trackId,
          phoneNumber,
          amount
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok) {
        // Poll for payment status
        return await pollPaymentStatus(data.referenceId);
      } else {
        throw new Error(data.message || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Error purchasing track:', error);
      return false;
    }
  };

  // Poll payment status until completion or timeout
  const pollPaymentStatus = async (referenceId: string): Promise<boolean> => {
    const maxAttempts = 20; // 20 attempts * 3 seconds = 60 seconds timeout
    let attempts = 0;

    return new Promise((resolve) => {
      const poll = async () => {
        attempts++;
        
        try {
          const response = await fetch(`/api/payments/status/${referenceId}`, {
            credentials: 'include'
          });
          
          const data = await response.json();
          
          if (response.ok) {
            if (data.status === 'completed') {
              resolve(true);
              return;
            } else if (data.status === 'failed') {
              resolve(false);
              return;
            }
          }
        } catch (error) {
          console.error('Error polling payment status:', error);
        }

        // Continue polling if not completed and within attempt limit
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000); // Check every 3 seconds
        } else {
          resolve(false); // Timeout
        }
      };

      poll();
    });
  };

  // Clear payment cache for a track
  const clearPaymentCache = (trackId: string) => {
    setPaymentStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[trackId];
      return newStatus;
    });
  };

  return {
    checkPaymentStatus,
    paymentStatus,
    purchaseTrack,
    clearPaymentCache
  };
};