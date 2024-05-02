import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
const AuthContext = createContext(null);



export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [balance, setBalance] = useState(0);

    const fetchBalance = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/users/balance/', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` }
            });
            if (response.data) {
                setBalance(response.data.balance);
            }
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        }
    };

    const updateBalance = async (newBalance) => {
        if (newBalance >= 0) {
            try {
                const response = await axios.post('http://localhost:8000/api/users/update_balance/', { balance: newBalance }, {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` }
                });
                if (response.status === 200) {
                    setBalance(response.data.balance);
                }
            } catch (error) {
                console.error('Failed to update balance:', error);
            }
        } else {
            alert('Please enter a positive amount.');
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchBalance();
        }
    }, [isLoggedIn]);

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
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.access}`; // Set default authorization header for axios
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
            const refreshToken = sessionStorage.getItem('refreshToken');
            const response = await axios.post('http://localhost:8000/api/token/refresh/', {
                refresh: refreshToken
            });
    
            if (response.data.access) {
                sessionStorage.setItem('accessToken', response.data.access);
                return response.data.access;
            } else {
                throw new Error('Failed to refresh token');
            }
        } catch (error) {
            console.error('Failed to refresh token:', error);
            logout();
            throw error; // Important: rethrow the error after handling it
        }
    };

    axios.interceptors.response.use(
        response => response,
        async error => {
            const originalRequest = error.config;
            // Check if it's a 401 error and we haven't retried yet
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const accessToken = await refreshAccessToken(); // Refresh the token
                    if (accessToken) {
                        // On successful refresh, retry the original request with new token
                        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                        return axios(originalRequest);
                    }
                } catch (refreshError) {
                    return Promise.reject(refreshError); // If refresh fails, reject the promise
                }
            }
            return Promise.reject(error); // For all other errors
        }
    );

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, register, balance, fetchBalance, updateBalance }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
