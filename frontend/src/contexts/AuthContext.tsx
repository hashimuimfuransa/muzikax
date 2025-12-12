'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { updateUserProfile } from '@/services/userService'

interface User {
  id: string
  name: string
  email: string
  role: 'fan' | 'creator' | 'admin'
  creatorType?: 'artist' | 'dj' | 'producer'
  avatar?: string
  bio?: string
  genres?: string[]
  followersCount?: number
  followingCount?: number
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  upgradeToCreator: (creatorType: 'artist' | 'dj' | 'producer') => Promise<boolean>
  updateProfile: (updatedData: Partial<User>) => Promise<boolean>
  isAuthenticated: boolean
  userRole: 'fan' | 'creator' | 'admin' | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
      console.log('Attempting to upgrade to creator:', { creatorType });
      
      let accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.error('No access token found');
        alert('Authentication error. Please log in again.');
        logout(); // Clear user data and redirect to login
        return false;
      }

      let response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upgrade/to-creator`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ creatorType })
      });

      console.log('Upgrade response status:', response.status);

      if (response.status === 401) {
        console.log('Token might be expired, attempting to refresh...');
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            localStorage.setItem('accessToken', refreshData.accessToken);
            localStorage.setItem('refreshToken', refreshData.refreshToken);
            
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
            console.error('Token refresh failed');
            alert('Session expired. Please log in again.');
            logout();
            return false;
          }
        } else {
          console.error('No refresh token found');
          alert('Session expired. Please log in again.');
          logout();
          return false;
        }
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to upgrade to creator:', errorData.message);
        
        alert(`Upgrade failed: ${errorData.message || 'Unknown error'}`);
        return false;
      }

      const updatedUserData = await response.json();
      console.log('Upgrade successful:', updatedUserData);
      
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      return true;
    } catch (error) {
      console.error('Error upgrading to creator:', error);
      alert('An error occurred while upgrading your account. Please try again.');
      return false;
    }
  };

  const updateProfile = async (updatedData: Partial<User>): Promise<boolean> => {
    if (!user) {
      console.error('No user found for profile update');
      return false;
    }

    try {
      // Send update request to backend
      const updatedUser = await updateUserProfile(updatedData);
      
      if (!updatedUser) {
        console.error('Failed to update profile on backend');
        return false;
      }

      // Update local state and localStorage with the response from backend
      setUser({
        ...user,
        ...updatedData,
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        creatorType: updatedUser.creatorType,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        genres: updatedUser.genres,
        followersCount: updatedUser.followersCount
      });
      
      localStorage.setItem('user', JSON.stringify({
        ...user,
        ...updatedData,
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        creatorType: updatedUser.creatorType,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        genres: updatedUser.genres,
        followersCount: updatedUser.followersCount
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  const isAuthenticated = !!user
  const userRole = user?.role || null
  
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