import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CryptoChart from './charts/CryptoChart';
import TradeCrypto from './TradeCrypto';
import StrategyList from './strategies/StrategyList';
import BacktestResults from './strategies/BacktestResults';
import StrategyModal from './MACStrategyModal';
import StrategyInfoModal from './StrategyInfoModal';
import StrategyModalFactory from './StrategyModalFactory';
import '../App.css';
import { useAuth } from '../context/AuthContext';
import SavedStrategiesDropdown from './SavedStrategiesDropdown';

const Dashboard = () => {
    const { fetchBalance } = useAuth();
    const [coin, setCoin] = useState('bitcoin');
    const [days, setDays] = useState('1');
    const [liveMode, setLiveMode] = useState(false);
    const [simulationSpeed, setSimulationSpeed] = useState(1000); // 1 second by default
    const [currentPrice, setCurrentPrice] = useState(0);
    const [editingStrategy, setEditingStrategy] = useState(null);
    const [infoStrategy, setInfoStrategy] = useState(null);
    const [backtestResults, setBacktestResults] = useState(null);
    const [showStrategyModal, setShowStrategyModal] = useState(false);
    const [showStrategyInfoModal, setShowStrategyInfoModal] = useState(false);
    const [selectedSavedStrategy, setSelectedSavedStrategy] = useState(null);

    useEffect(() => {
        console.log('Selected Saved Strategy: ');
        console.log(selectedSavedStrategy);
    }, [selectedSavedStrategy]);

    const handleSelectedSavedStrategy = (strategy, onSelectedSavedStrategy) => {
        onSelectedSavedStrategy(strategy);

    };
    const toggleLiveMode = (isActive) => {
        setLiveMode(isActive);
    };
    
    const handlePriceUpdate = (newPrice) => {
        setCurrentPrice(newPrice);
    };

    const handleStrategySelect = (strategy) => {
        setEditingStrategy(strategy);
        setShowStrategyModal(true);
    };

    const handleShowStrategyInfo = (strategy) => {
        setInfoStrategy(strategy); // Set the strategy for the info modal
        setShowStrategyInfoModal(true);
    };

    const handleCloseStrategyModal = () => {
        setShowStrategyModal(false);
    };

    const handleCloseInfoModal = () => {
        setShowStrategyInfoModal(false);
    };
    
    const handleRunBacktest = async (strategyParameters, endpoint) => {
        const response = await fetch(`http://localhost:8000/api/strategies/backtest/${endpoint}/`, { // Ensure URL is correctly constructed
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(strategyParameters)
        });
        if (response.ok) {
            const data = await response.json();
            setBacktestResults(data);
        } else {
            console.error('Failed to run backtest', response.statusText);
            setBacktestResults(null);
        }
    }

    return (
        <div className="dashboard">
            <div className="chart-and-trade-section">
                <div className="chart-section">
                    <h1>{coin.toUpperCase()} Historical Price Chart</h1>
                    <div className="controls">
                        <select onChange={(e) => setCoin(e.target.value)}>
                            <option value="bitcoin">Bitcoin</option>
                            <option value="ethereum">Ethereum</option>
                            <option value="ripple">XRP</option>
                        </select>
                        <select onChange={(e) => setDays(e.target.value)}>
                            <option value="1">Last 24 hours</option>
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                        </select>
                        <button className='modern-button' style={{ backgroundColor: liveMode ? 'green' : 'grey' }} onClick={() => toggleLiveMode(!liveMode)}>Toggle Live Mode</button>
                        <div>
                            <label htmlFor="speedSlider">Simulation Speed (ms): </label>
                            <input
                                id="speedSlider"
                                type="range"
                                min="100"
                                max="5000"
                                step="100"
                                value={simulationSpeed}
                                onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                            />
                            <span>{simulationSpeed} ms</span>
                        </div>
                    </div>
                    <CryptoChart 
                        coin={coin} 
                        days={days} 
                        live={liveMode} 
                        onPriceUpdate={handlePriceUpdate} 
                        simulationSpeed={simulationSpeed} 
                        selectedSavedStrategy={selectedSavedStrategy}
                    />
                </div>
                <div className="trade-section">
                    <TradeCrypto coin={coin} currentPrice={currentPrice} fetchBalance={fetchBalance}/>
                </div>
                <div>
                    <SavedStrategiesDropdown onSelectedSavedStrategy={(strategy) => handleSelectedSavedStrategy(strategy, setSelectedSavedStrategy)}/>
                </div>
            </div>
            <div className="strategy-section">
                <StrategyList onSelectStrategy={handleStrategySelect} onShowStrategyInfo={handleShowStrategyInfo} />
                {editingStrategy && (
                    <StrategyModalFactory
                        strategyType={editingStrategy.name}
                        show={showStrategyModal}
                        handleClose={handleCloseStrategyModal}
                        selectedStrategy={editingStrategy}
                        onRunBacktest={handleRunBacktest}
                    />
                )}
                {infoStrategy && (
                    <StrategyInfoModal
                        show={showStrategyInfoModal}
                        onHide={handleCloseInfoModal}
                        strategy={infoStrategy}
                    />
                )}
                {backtestResults && (
                    <BacktestResults results={backtestResults} />
                )}
               
            </div>
            
        </div>
    );
};

export default Dashboard;
