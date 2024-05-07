import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Form } from 'react-bootstrap';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [selectedCrypto, setSelectedCrypto] = useState('all');
    const [cryptos, setCryptos] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/users/profile/', {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
                });
                setProfile(response.data);

                const transResponse = await axios.get('http://localhost:8000/api/users/transactions/', {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
                });
                setTransactions(transResponse.data);
                setFilteredTransactions(transResponse.data);

                // Extract unique cryptos
                const uniqueCryptos = new Set(transResponse.data.map(txn => txn.crypto));
                setCryptos(['all', ...Array.from(uniqueCryptos)]);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data.');
                if (err.response && err.response.status === 401) {
                    setError('Unauthorized access. Please log in again.');
                } else if (err.response && err.response.status === 500) {
                    setError('Server error. Please try again later.');
                }
            }
        };

        fetchProfile();
    }, []);

    useEffect(() => {
        if (selectedCrypto === 'all') {
            setFilteredTransactions(transactions);
        } else {
            setFilteredTransactions(transactions.filter(txn => txn.crypto === selectedCrypto));
        }
    }, [selectedCrypto, transactions]);

    const handleCryptoChange = (event) => {
        setSelectedCrypto(event.target.value);
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <p>Date: {data.date}</p>
                    <p>Type: {data.type}</p>
                    <p>PnL: ${data.pnl.toFixed(2)}</p>
                    <p>Amount: {data.amount}</p>
                    <p>Crypto: {data.crypto}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="profile-page">
            <h1>Profile</h1>
            {profile ? (
                <div className="profile-details">
                    <p><strong>Username:</strong> {profile.user}</p>
                    <p><strong>Balance:</strong> ${profile.balance.toFixed(2)}</p>
                    <p><strong>Total Trades:</strong> {profile.total_trades}</p>
                    <p><strong>Profit/Loss:</strong> ${profile.profit_loss.toFixed(2)}</p>
                </div>
            ) : (
                <p>{error || "Loading profile..."}</p>
            )}
            <div>
                <Form.Group controlId="cryptoSelect">
                    <Form.Label>Filter by Crypto</Form.Label>
                    <Form.Control as="select" value={selectedCrypto} onChange={handleCryptoChange}>
                        {cryptos.map((crypto, index) => (
                            <option key={index} value={crypto}>{crypto}</option>
                        ))}
                    </Form.Control>
                </Form.Group>
            </div>
            {filteredTransactions.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                        data={filteredTransactions.map(txn => ({
                            date: new Date(txn.date).toLocaleDateString(),
                            pnl: txn.pnl,
                            type: txn.type,
                            amount: txn.amount,
                            crypto: txn.crypto
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="pnl" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default Profile;
