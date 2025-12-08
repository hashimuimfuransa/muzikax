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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

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
  }, [])

  const login = (userData: User) => {
    console.log('AuthProvider - login called with:', userData);
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    console.log('AuthProvider - logout called');
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
  }

  const upgradeToCreator = async (creatorType: 'artist' | 'dj' | 'producer'): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      // Make API call to upgrade user to creator
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/upgrade-to-creator`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ creatorType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to upgrade to creator:', errorData.message);
        return false;
      }

      const updatedUserData = await response.json();
      
      // Update user in context and localStorage
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      return true;
    } catch (error) {
      console.error('Error upgrading to creator:', error);
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

  return (
    <AuthContext.Provider value={{ user, login, logout, upgradeToCreator, updateProfile, isAuthenticated, userRole }}>
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