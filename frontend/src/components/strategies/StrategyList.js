import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { InfoCircle } from 'react-bootstrap-icons';
import { Button } from 'react-bootstrap';

const StrategyList = ({ onSelectStrategy, onShowStrategyInfo }) => {
    const [strategies, setStrategies] = useState([]);

    useEffect(() => {
        const fetchStrategies = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/strategies/list/', {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
                    }
                });
                setStrategies(response.data);
            } catch (error) {
                console.error('Failed to fetch strategies', error.response || error);
            }
        };

        fetchStrategies();
    }, []);

    return (
        <div>
            <h2>Available Strategies</h2>
            <ul>
                {strategies.filter(strategy => strategy.name !== "EMA Strategy").map((strategy) => (
                    <li key={strategy.id}>
                        {strategy.name}
                        <Button variant="outline-success" onClick={() => onSelectStrategy(strategy)} style={{ marginRight: '10px', marginLeft: '10px'}}> Edit </Button>
                        <button onClick={() => onShowStrategyInfo(strategy)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                            <InfoCircle />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StrategyList;
