import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem('token');
        return storedToken && storedToken !== 'null' ? storedToken : null;
    });

    const [authLoading, setAuthLoading] = useState(false); 

    const login = (username, role, authToken, userId, roleId, managesMess) => {
        setAuthLoading(true);
        const userData = { username, role, userId, roleId, managesMess };
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
        setAuthLoading(false);
    };

    const logout = () => {
        setAuthLoading(true);
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setAuthLoading(false);
    };

    const value = {
        user, // Full user object
        authLoading, // Explicit loading state
        token,
        isAuthenticated: !!token,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};
