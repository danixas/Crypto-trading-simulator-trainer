import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:8000/api/users/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                sessionStorage.setItem('accessToken', data.access); // Store the access token
                sessionStorage.setItem('refreshToken', data.refresh); // Store the refresh token
                setIsLoggedIn(true); // Update login state
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            console.error('Failed to login:', error);
        }
    };
    

    const register = async (username, password) => {
        try {
            const response = await fetch('http://localhost:8000/api/users/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Registration successful:', data.message);
            } else {
                throw new Error(data.message || 'Failed to register');
            }
        } catch (error) {
            console.error('Failed to register:', error);
            throw error; // Rethrow the error after logging it, so the UI can react to it
        }
    };

    const logout = () => {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        setIsLoggedIn(false);
    };

    const refreshAccessToken = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/token/refresh/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: sessionStorage.getItem('refreshToken') }),
            });
            const data = await response.json();
            sessionStorage.setItem('accessToken', data.access);
            return data.access;
        } catch (error) {
            console.error('Failed to refresh token:', error);
            logout(); // Optionally logout the user if refresh fails
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
