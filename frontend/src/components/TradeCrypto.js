import React, { useState } from 'react';
import axios from 'axios';
import { Button } from 'react-bootstrap';

const TradeCrypto = ({ coin, currentPrice, fetchBalance }) => {

    const [amountUSD, setAmountUSD] = useState('');
    const [activeTrades, setActiveTrades] = useState([]);
    const [completedTrades, setCompletedTrades] = useState([]);
    const [totalPnL, setTotalPnL] = useState(0);

    const handleTrade = async (type) => {
        if (!amountUSD || !currentPrice) return;
        try {
            const response = await axios.post('http://localhost:8000/api/crypto/auth/trade/', {
                crypto: coin,
                amount: parseFloat(amountUSD),
                type: type,
                price: Number(currentPrice)  // Ensure currentPrice is a number
            }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`
                }
            });

            if (response.data.detail === 'Transaction successful') {
                setActiveTrades([...activeTrades, {
                    transactionId: response.data.transactionId,
                    type: type,
                    amount: Number(response.data.amount).toFixed(4),  // Convert and format
                    price: Number(response.data.price).toFixed(2)  // Convert and format
                }]);
                setAmountUSD('');
                fetchBalance();
            } else {
                alert(response.data.detail);
            }
        } catch (error) {
            console.error('Trade Error:', error);
            alert('Trading failed, check if Live mode is on.');
        }
    };

    const handleCloseTrade = async (transactionId) => {
        if (!transactionId) {
            alert('Transaction ID is missing');
            return;
        }
    
        try {
            
            const response = await axios.post(`http://localhost:8000/api/crypto/auth/close_trade/${transactionId}/`, {
                price: Number(currentPrice)
            }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`
                }
            });
    
            if (response.data.detail === 'Trade closed successfully') {
                fetchBalance();
                const updatedActiveTrades = activeTrades.filter(trade => trade.transactionId !== transactionId);
                setActiveTrades(updatedActiveTrades);
                const closedTrade = activeTrades.find(trade => trade.transactionId === transactionId);
                closedTrade.pnl = Number(response.data.pnl).toFixed(2);
                setCompletedTrades([...completedTrades, closedTrade]);
                setTotalPnL(totalPnL + Number(closedTrade.pnl));
            } else {
                alert(response.data.detail);
            }
        } catch (error) {
            console.error('Error closing trade:', error);
            alert('Failed to close the trade, check console for details.');
        }
    };

    return (
        <div className="trade-container">
            <h2>Trade {coin.toUpperCase()}</h2>
            <p>Current Price: ${currentPrice ? Number(currentPrice).toFixed(2) : 'Loading...'}</p>
            <div className="trade-input-group">
                <input 
                    type="number" 
                    value={amountUSD} 
                    onChange={e => setAmountUSD(e.target.value)} 
                    placeholder="Enter amount in USD" 
                    className="trade-amount-input"
                />
                <Button variant="outline-success" onClick={() => handleTrade('buy')}>Buy</Button>
                <Button variant="outline-danger" onClick={() => handleTrade('sell')}>Sell</Button>
            </div>
            <div>
                <h3>Active Trades</h3>
                <ul>
                    {activeTrades.map((trade, index) => (
                        <li key={index}>
                            {trade.type} {trade.amount} {coin} at ${trade.price}
                            <button onClick={() => handleCloseTrade(trade.transactionId)}>Close Trade</button>
                        </li>
                    ))}
                </ul>
            </div>
            <div>
                <h3>Completed Trades <div className={`pnl-total ${totalPnL >= 0 ? 'profit' : 'loss'}`}>PnL: ${Number(totalPnL).toFixed(2)}</div></h3>
                <ul>
                    {completedTrades.map((trade, index) => (
                        <li key={index}>
                            {trade.type} {trade.amount} {coin} at ${trade.price}, <span className={trade.pnl >= 0 ? 'profit' : 'loss'}>${trade.pnl}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default TradeCrypto;
