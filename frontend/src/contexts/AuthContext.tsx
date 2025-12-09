'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'fan' | 'creator' | 'admin'
  creatorType?: 'artist' | 'dj' | 'producer'
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  upgradeToCreator: (creatorType: 'artist' | 'dj' | 'producer') => Promise<boolean>
  updateProfile: (updatedData: Partial<User>) => void
  isAuthenticated: boolean
  userRole: 'fan' | 'creator' | 'admin' | null
  isLoading: boolean // Add loading state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true) // Add loading state

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user')
    console.log('AuthProvider - storedUser:', storedUser);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        console.log('AuthProvider - parsedUser:', parsedUser);
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
    // Set loading to false after checking localStorage
    setIsLoading(false)
  }, [])

  const login = (userData: User) => {
    console.log('AuthProvider - login called with:', userData);
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    console.log('AuthProvider - logout called');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const upgradeToCreator = async (creatorType: 'artist' | 'dj' | 'producer'): Promise<boolean> => {
    if (!user) {
      console.error('No user found for upgrade');
      return false;
    }

    try {
      // Log the upgrade attempt
      console.log('Attempting to upgrade to creator:', { creatorType });
      
      // Get access token from localStorage
      let accessToken = localStorage.getItem('accessToken');
      
      // Check if token exists
      if (!accessToken) {
        console.error('No access token found');
        alert('Authentication error. Please log in again.');
        logout(); // Clear user data and redirect to login
        return false;
      }

      // Make API call to upgrade user to creator (using new endpoint)
      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upgrade/to-creator`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ creatorType })
      });

      console.log('Upgrade response status:', response.status);

      // If token is expired, try to refresh it
      if (response.status === 401) {
        console.log('Token might be expired, attempting to refresh...');
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Try to refresh the token
          const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            // Save new tokens
            localStorage.setItem('accessToken', refreshData.accessToken);
            localStorage.setItem('refreshToken', refreshData.refreshToken);
            
            // Retry the original request with new token
            accessToken = refreshData.accessToken;
            response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upgrade/to-creator`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({ creatorType })
            });
          } else {
            // Refresh failed, force logout
            console.error('Token refresh failed');
            alert('Session expired. Please log in again.');
            logout();
            return false;
          }
        } else {
          // No refresh token available, force logout
          console.error('No refresh token found');
          alert('Session expired. Please log in again.');
          logout();
          return false;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to upgrade to creator:', errorData.message);
        
        // Show error to user
        alert(`Upgrade failed: ${errorData.message || 'Unknown error'}`);
        return false;
      }

      const updatedUserData = await response.json();
      console.log('Upgrade successful:', updatedUserData);
      
      // Update user in context and localStorage
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      return true;
    } catch (error) {
      console.error('Error upgrading to creator:', error);
      alert('An error occurred while upgrading your account. Please try again.');
      return false;
    }
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updatedData
      }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const isAuthenticated = !!user
  const userRole = user?.role || null
  
  // Debug logging
  useEffect(() => {
    console.log('AuthContext values:', { user, isAuthenticated, userRole, isLoading });
  }, [user, isAuthenticated, userRole, isLoading]);

  return (
    <AuthContext.Provider value={{ user, login, logout, upgradeToCreator, updateProfile, isAuthenticated, userRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}