// src/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRefreshToken } from '../hooks/authHook';
import { jwtDecode } from 'jwt-decode';
import type { DecodedToken } from '../types/auth';


interface AuthContextType {
    access_token: string | null;
    refresh_token: string | null;
    login: (tokens: { access_token: string; refresh_token: string }) => void;
    logout: () => void;
    authData: {
        userId: string;
        username: string;
    }
}



const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [access_token, setAccessToken] = useState<string | null>(localStorage.getItem('access_token'));
    const [refresh_token, setRefreshToken] = useState<string | null>(localStorage.getItem('refresh_token'));
    const [authData, setAuthData] = React.useState<{ userId: string; username: string }>({
        userId: "",
        username: "",
    });

    const { mutate: refresh } = useRefreshToken();

    const login = (tokens: { access_token: string; refresh_token: string }) => {
        setAccessToken(tokens.access_token);
        setRefreshToken(tokens.refresh_token);
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
    };

    const logout = () => {
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_Token');
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (refresh_token) {
                refresh({ refresh_token });
            }
        }, 23 * 60 * 60 * 1000); // Refresh every 23 hours

        return () => clearInterval(interval);
    }, [refresh_token, refresh]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded = jwtDecode<DecodedToken>(token);
                const formattedUsername = decoded.username
                    .split('-')
                    .map(name => name.charAt(0).toUpperCase() + name.slice(1))
                    .join(' ');
                setAuthData({ userId: decoded.userId, username: formattedUsername });

            } catch (error) {
                console.error("Failed to decode access token:", error);
                setAuthData({ userId: 'tg', username: "j" });
            }
        }
    }, [authData]);

    return (
        <AuthContext.Provider value={{ access_token, refresh_token, login, logout, authData  }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
