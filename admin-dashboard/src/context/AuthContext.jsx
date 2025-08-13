import React, { createContext, useContext, useState, useEffect } from 'react';

// AuthContext no longer needs to be exported, as it's only used internally.
const AuthContext = createContext();

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on app start
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Error parsing user data:', error);
                logout();
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData, tokens) => {
        // Store tokens
        localStorage.setItem('authToken', tokens.access_token);
        localStorage.setItem('refreshToken', tokens.refresh_token);

        // Store user data
        const userToStore = {
            ...userData,
            regionId: userData.regionId
        };
        localStorage.setItem('userData', JSON.stringify(userToStore));

        setUser(userToStore);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateTokens = (tokens) => {
        localStorage.setItem('authToken', tokens.access_token);
        if (tokens.refresh_token) {
            localStorage.setItem('refreshToken', tokens.refresh_token);
        }
    };

    const value = {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        updateTokens
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
