import numpy as np
import pandas as pd

def calculate(data, short_term, long_term, initial_capital, max_trade_size_percent):
    # Calculate moving averages
    data['short_ma'] = data['price'].rolling(window=short_term, min_periods=1).mean()
    data['long_ma'] = data['price'].rolling(window=long_term, min_periods=1).mean()

    # Generate signals based on the crossover
    data['signal'] = np.where(data['short_ma'] > data['long_ma'], 1, 0)
    data['positions'] = data['signal'].diff()

    return execute_trades(data, initial_capital, max_trade_size_percent, short_term, long_term)

def execute_trades(data, initial_capital, max_trade_size_percent, short_term, long_term):
    capital = initial_capital
    current_investment = 0
    pnl = 0
    num_trades = 0
    wins = 0

    for index, row in data.iterrows():
        max_trade_size = capital * max_trade_size_percent / 100
        if row['positions'] == 1 and current_investment == 0:  # Buy signal
            units_to_buy = max_trade_size / row['price']
            capital -= units_to_buy * row['price']
            current_investment = units_to_buy
            num_trades += 1
            print(f"Buying {max_trade_size}$ at {row['timestamp']} - Price: {row['price']}, Units: {units_to_buy}")
        elif row['positions'] == -1 and current_investment > 0:  # Sell signal
            capital += current_investment * row['price']
            trade_pnl = (current_investment * row['price']) - (current_investment * data.at[data.index[data.index.get_loc(index) - 1], 'price'])
            pnl += trade_pnl
            if trade_pnl > 0:
                wins += 1
            current_investment = 0
            print(f"Selling {max_trade_size}$ at {row['timestamp']} - Price: {row['price']}, PnL: {trade_pnl}")

    losses = num_trades - wins
    win_loss_ratio = wins / losses if losses > 0 else 'infinite'

    return {
            "strategy_type": "MAC",
            "parameters": {
                "short_term": short_term,
                "long_term": long_term,
                "initial_capital": initial_capital,
                "max_trade_size_percent": max_trade_size_percent
            },
            "pnl": pnl,
            "numTrades": num_trades,
            "winLossRatio": win_loss_ratio,
            "finalCapital": capital
        }