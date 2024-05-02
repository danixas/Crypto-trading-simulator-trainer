import React, { useState, useEffect, memo } from 'react';

const CryptoSelector = ({ onChange }) => {
    const [cryptos, setCryptos] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('http://localhost:8000/api/crypto/list');
            const data = await response.json();
            setCryptos(data);
        };
        fetchData();
    }, []);

    return (
        <select onChange={e => onChange(e.target.value)}>
            <option value="bitcoin">Bitcoin</option>
            <option value="ethereum">Ethereum</option>
            {cryptos.map(crypto => (
                <option key={crypto.coin_id} value={crypto.coin_id}>{crypto.name}</option>
            ))}
        </select>
    );
};


export default CryptoSelector;