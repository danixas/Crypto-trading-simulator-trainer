import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BacktestResults = ({ results, onSave }) => {
    const [strategyName, setStrategyName] = useState('');

    useEffect(() => {
        if(results.strategy_name) {
            setStrategyName(results.strategy_name);
        }
    }, [results]);
    const saveStrategy = async () => {
        console.log('Results:', results);
        console.log('Strategy Name in backtest results:', strategyName);
        const params = {
            strategy_name: strategyName,
            strategy_type: results.strategy_type,
            parameters: results.parameters
        };
        console.log("trying to save strategy: ", params);
        try {
            const response = await axios.post('http://localhost:8000/api/users/save_strategy/', params, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}` }
            });
            onSave();
            alert('Strategy saved successfully!');
        } catch (error) {
            console.error('Error saving strategy:', error);
            alert('Failed to save strategy.');
        }
    };

    return (
        <div>
            <h3>Backtest Results</h3>
            <p>Profit/Loss: {results.pnl}</p>
            <p>Number of Trades: {results.numTrades}</p>
            <p>Win/Loss Ratio: {results.winLossRatio}</p>
            {results.strategy_type !== 'ML' && (
                <input
                    type="text"
                    value={strategyName}
                    onChange={e => setStrategyName(e.target.value)}
                    placeholder="Enter strategy name"
                />
            )}
            <button onClick={saveStrategy}>Save Strategy</button>
        </div>
    );
};

export default BacktestResults;
