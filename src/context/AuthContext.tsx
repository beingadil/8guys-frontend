
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';

interface AuthContextType {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('ph_session_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);

        const handleUnauthorized = () => {
            console.log("Auth failure event received. Logging out...");
            logout();
        };

        window.addEventListener('unauthorized', handleUnauthorized);
        return () => window.removeEventListener('unauthorized', handleUnauthorized);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('ph_session_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ph_session_user');
        localStorage.removeItem('ph_auth_token');
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('ph_session_user', JSON.stringify(userData));
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
