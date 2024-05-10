import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SavedStrategiesDropdown = ({ onSelectedSavedStrategy, strategyCount }) => {
    const [strategies, setStrategies] = useState([]);
    const [selectedStrategy, setSelectedStrategy] = useState('');

    useEffect(() => {
        const fetchStrategies = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/users/saved_strategies/', {
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
                    }
                });
                setStrategies(response.data);
            } catch (error) {
                console.error('Error fetching strategies:', error);
            }
        };
        console.log("strategy count in dropdown: ", strategyCount);
        fetchStrategies();
    }, [strategyCount]);

    const handleSelectionChange = (e) => {
        setSelectedStrategy(e.target.value);
        if (onSelectedSavedStrategy) {
            const selectedStrategyObj = strategies.find(strategy => strategy.strategy_name === e.target.value);
            onSelectedSavedStrategy(selectedStrategyObj);
        }
    };
    
    return (
        <div>
            <select value={selectedStrategy} onChange={handleSelectionChange}>
                <option value="">Select a Strategy</option>
                {strategies.map(strategy => (
                    <option key={strategy.strategy_name} value={strategy.strategy_name}>
                        {strategy.strategy_name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default SavedStrategiesDropdown;
