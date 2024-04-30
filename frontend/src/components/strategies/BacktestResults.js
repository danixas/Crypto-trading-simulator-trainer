import React from 'react';

const BacktestResults = ({ results }) => {
    return (
        <div>
            <h3>Backtest Results</h3>
            <p>Profit/Loss: {results.pnl}</p>
            <p>Number of Trades: {results.numTrades}</p>
            <p>Win/Loss Ratio: {results.winLossRatio}</p>
        </div>
    );
};

export default BacktestResults;
