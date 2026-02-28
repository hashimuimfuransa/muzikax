'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { updateUserProfile, updateUserWhatsAppContact } from '@/services/userService';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        // Check if we're in the browser before accessing localStorage
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('user');
            console.log('AuthProvider - storedUser:', storedUser);
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    console.log('AuthProvider - parsedUser:', parsedUser);
                    // Ensure whatsappContact is a string, not an object
                    if (parsedUser && parsedUser.whatsappContact) {
                        if (typeof parsedUser.whatsappContact === 'object' && parsedUser.whatsappContact !== null) {
                            // If it's an object, extract the actual WhatsApp number
                            parsedUser.whatsappContact = parsedUser.whatsappContact.whatsappContact || '';
                        }
                    }
                    setUser(parsedUser);
                    // Fetch complete user profile to ensure followers count and other data is up to date
                    fetchUserProfile();
                }
                catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
            else {
                setIsLoading(false);
            }
        }
        else {
            // On the server, just set loading to false
            setIsLoading(false);
        }
    }, []);
    const login = (userData) => {
        console.log('AuthProvider - login called with:', userData);
        setUser(userData);
        // Check if we're in the browser before accessing localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(userData));
        }
    };
    
    // Module-level variable to track profile fetch attempts and avoid race conditions
    let userProfileRefreshPromise = null;

    // Function to fetch and update the complete user profile
    const fetchUserProfile = async () => {
        // Check if we're in the browser before accessing localStorage
        if (typeof window === 'undefined') {
            console.log('Not running in browser, skipping fetchUserProfile');
            return false;
        }

        // If a fetch is already in progress, return its result
        if (userProfileRefreshPromise) {
            return await userProfileRefreshPromise;
        }

        userProfileRefreshPromise = (async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    console.error('No access token found');
                    return false;
                }
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (!response.ok) {
                    if (response.status === 401) {
                        // Token might be expired, attempt refresh
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
                                // Retry the profile request with new token
                                const retryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
                                    method: 'GET',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${refreshData.accessToken}`
                                    }
                                });
                                if (!retryResponse.ok) {
                                    console.error('Failed to fetch user profile after token refresh');
                                    setIsLoading(false);
                                    return false;
                                }
                                const updatedUserData = await retryResponse.json();
                                // Ensure whatsappContact is a string, not an object
                                let whatsappContactValue = updatedUserData.whatsappContact || '';
                                if (typeof whatsappContactValue === 'object' && whatsappContactValue !== null) {
                                    // If it's an object, extract the actual WhatsApp number
                                    whatsappContactValue = whatsappContactValue.whatsappContact || '';
                                }
                                const completeUser = Object.assign(Object.assign({}, updatedUserData), { id: updatedUserData._id, whatsappContact: whatsappContactValue });
                                setUser(completeUser);
                                localStorage.setItem('user', JSON.stringify(completeUser));
                                setIsLoading(false);
                                return true;
                            }
                        }
                    }
                    console.error('Failed to fetch user profile:', response.status);
                    setIsLoading(false);
                    return false;
                }
                const updatedUserData = await response.json();
                // Ensure whatsappContact is a string, not an object
                let whatsappContactValue = updatedUserData.whatsappContact || '';
                if (typeof whatsappContactValue === 'object' && whatsappContactValue !== null) {
                    // If it's an object, extract the actual WhatsApp number
                    whatsappContactValue = whatsappContactValue.whatsappContact || '';
                }
                const completeUser = Object.assign(Object.assign({}, updatedUserData), { id: updatedUserData._id, whatsappContact: whatsappContactValue });
                setUser(completeUser);
                localStorage.setItem('user', JSON.stringify(completeUser));
                setIsLoading(false);
                return true;
            }
            catch (error) {
                console.error('Error fetching user profile:', error);
                setIsLoading(false);
                return false;
            } finally {
                userProfileRefreshPromise = null;
            }
        })();

        return await userProfileRefreshPromise;
    };
    const logout = () => {
        console.log('AuthProvider - logout called');
        setUser(null);
        // Check if we're in the browser before accessing localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            // Redirect to login page
            window.location.href = '/login';
        }
    };
    const upgradeToCreator = async (creatorType) => {
        // Check if we're in the browser before accessing localStorage
        if (typeof window === 'undefined') {
            console.log('Not running in browser, cannot upgrade user');
            return false;
        }
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
                    }
                    else {
                        console.error('Token refresh failed');
                        alert('Session expired. Please log in again.');
                        logout();
                        return false;
                    }
                }
                else {
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
        }
        catch (error) {
            console.error('Error upgrading to creator:', error);
            alert('An error occurred while upgrading your account. Please try again.');
            return false;
        }
    };
    const updateProfile = async (updatedData) => {
        // Check if we're in the browser before accessing localStorage
        if (typeof window === 'undefined') {
            console.log('Not running in browser, cannot update profile');
            return false;
        }
        if (!user) {
            console.error('No user found for profile update');
            return false;
        }
        try {
            // Send update request to backend
            const updatedUser = await updateUserProfile(updatedData);
            if (!updatedUser) {
                console.error('Failed to update profile on backend');
                // Check if it's an authentication issue
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    logout();
                }
                return false;
            }
            // Ensure whatsappContact is a string, not an object
            let whatsappContactValue = updatedUser.whatsappContact || '';
            if (typeof whatsappContactValue === 'object' && whatsappContactValue !== null) {
                // If it's an object, extract the actual WhatsApp number
                whatsappContactValue = whatsappContactValue.whatsappContact || '';
            }
            // Update local state and localStorage with the response from backend
            const newUser = Object.assign(Object.assign(Object.assign({}, user), updatedData), { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, creatorType: updatedUser.creatorType, avatar: updatedUser.avatar, bio: updatedUser.bio, genres: updatedUser.genres, followersCount: updatedUser.followersCount, whatsappContact: whatsappContactValue // Ensure it's a string
             });
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            return true;
        }
        catch (error) {
            console.error('Error updating profile:', error);
            return false;
        }
    };
    const updateWhatsAppContact = async (whatsappContact) => {
        // Check if we're in the browser before accessing localStorage
        if (typeof window === 'undefined') {
            console.log('Not running in browser, cannot update WhatsApp contact');
            return false;
        }
        if (!user) {
            console.log('No user found for WhatsApp contact update');
            return false;
        }
        try {
            // Call the update function
            const updatedUser = await updateUserWhatsAppContact(whatsappContact);
            if (!updatedUser) {
                console.log('Failed to update WhatsApp contact on backend');
                return false;
            }
            // Extract the whatsappContact from the response and ensure it's a string
            let updatedWhatsAppContact = updatedUser.whatsappContact || '';
            if (typeof updatedWhatsAppContact === 'object' && updatedWhatsAppContact !== null) {
                // If it's an object, extract the actual WhatsApp number
                updatedWhatsAppContact = updatedWhatsAppContact.whatsappContact || '';
            }
            // Update local state and localStorage with the response from backend
            const newUser = Object.assign(Object.assign({}, user), { whatsappContact: updatedWhatsAppContact });
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
            return true;
        }
        catch (error) {
            console.error('Error updating WhatsApp contact:', error);
            return false;
        }
    };
    const isAuthenticated = !!user;
    const userRole = (user === null || user === void 0 ? void 0 : user.role) || null;
    useEffect(() => {
        // Only log in the browser
        if (typeof window !== 'undefined') {
            console.log('AuthContext values:', { user, isAuthenticated, userRole, isLoading });
        }
    }, [user, isAuthenticated, userRole, isLoading]);
    return (_jsx(AuthContext.Provider, { value: { user, login, logout, upgradeToCreator, updateProfile, updateWhatsAppContact, fetchUserProfile, isAuthenticated, userRole, isLoading }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
