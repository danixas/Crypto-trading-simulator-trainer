import React, { useState } from 'react';
import CryptoChart from './charts/CryptoChart';
import TradeCrypto from './TradeCrypto';
import StrategyList from './strategies/StrategyList';
import BacktestResults from './strategies/BacktestResults';
import StrategyModal from './MACStrategyModal';
import StrategyInfoModal from './StrategyInfoModal';
import StrategyModalFactory from './StrategyModalFactory';
import '../App.css';

const Dashboard = () => {
    const [coin, setCoin] = useState('bitcoin');
    const [days, setDays] = useState('1');
    const [liveMode, setLiveMode] = useState(false);
    const [simulationSpeed, setSimulationSpeed] = useState(1000); // 1 second by default
    const [currentPrice, setCurrentPrice] = useState(0);
    const [selectedStrategy, setSelectedStrategy] = useState(null);
    const [backtestResults, setBacktestResults] = useState(null);
    const [showStrategyModal, setShowStrategyModal] = useState(false);
    const [showStrategyInfoModal, setShowStrategyInfoModal] = useState(false);

    const toggleLiveMode = (isActive) => {
        setLiveMode(isActive);
    };
    
    const handlePriceUpdate = (newPrice) => {
        setCurrentPrice(newPrice);
    };

    const handleStrategySelect = (strategy) => {
        setSelectedStrategy(strategy);
        setBacktestResults(null);
        setShowStrategyModal(true);
    };

    const handleCloseModal = () => {
        setShowStrategyModal(false);
    }
    const handleRunBacktest = async (coin, strategyName, shortTerm, longTerm, dateRange, initialCapital, riskPerTrade) => {
        const payload = {
            coin,
            strategy_name: strategyName,
            short_term: shortTerm,
            long_term: longTerm,
            date_range: dateRange,
            initial_capital: initialCapital,
            max_trade_size_percent: riskPerTrade,
        };
        const response = await fetch(`http://localhost:8000/api/strategies/backtest/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (response.ok) {
            const data = await response.json();
            setBacktestResults(data);
        } else {
            console.error('Failed to run backtest');
            setBacktestResults(null);
        }
    };

    return (
        <div className="dashboard">
            <div className="chart-and-trade-section">
                <div className="chart-section">
                    <h1>{coin.toUpperCase()} Historical Price Chart</h1>
                    <div className="controls">
                        <select onChange={(e) => setCoin(e.target.value)}>
                            <option value="bitcoin">Bitcoin</option>
                            <option value="ethereum">Ethereum</option>
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
                    <CryptoChart coin={coin} days={days} live={liveMode} onPriceUpdate={handlePriceUpdate} simulationSpeed={simulationSpeed} />
                </div>
                <div className="trade-section">
                    <TradeCrypto coin={coin} currentPrice={currentPrice}/>
                </div>
            </div>
            <div className="strategy-section">
                <StrategyList onSelectStrategy={handleStrategySelect} onShowStrategyInfo={setShowStrategyInfoModal} />
                {selectedStrategy && (
                    <StrategyModalFactory
                        strategyType={selectedStrategy.name}
                        show={showStrategyModal}
                        handleClose={handleCloseModal}
                        selectedStrategy={selectedStrategy}
                        onRunBacktest={handleRunBacktest}
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
