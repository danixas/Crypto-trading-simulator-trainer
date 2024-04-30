import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
    const [profile, setProfileData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {

                const response = await axios.get('http://localhost:8000/api/users/profile/', {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`
                    }
                });
                setProfileData(response.data);
                setError('');  // Clear any previous errors if the fetch is successful
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('Failed to fetch profile data.');
                if (error.response) {
                    if (error.response.status === 401) {
                        // Unauthorized access, redirect to login or refresh token
                        console.log('Redirecting to login or refreshing token...');
                        setError('You are not authorized. Please login again.');
                    } else if (error.response.status === 500) {
                        // Server error
                        setError('Server error. Please try again later.');
                    }
                }
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            {profile ? (
                <>
                    <h1>Profile: {profile.user}</h1>
                    <p>Balance: ${profile.balance.toFixed(2)}</p>
                    <p>Total Trades: {profile.total_trades}</p>
                    <p>Profit/Loss: ${profile.profit_loss.toFixed(2)}</p>
                </>
            ) : (
                <p>{error || 'Loading...'}</p>
            )}
        </div>
    );
};

export default Profile;
