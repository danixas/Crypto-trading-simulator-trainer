import numpy as np
import pandas as pd

def calculate_rsi(prices, period=14):
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).fillna(0)
    loss = (-delta.where(delta < 0, 0)).fillna(0)

    avg_gain = gain.rolling(window=period, min_periods=1).mean()
    avg_loss = loss.rolling(window=period, min_periods=1).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi

def calculate(df, initial_capital, max_trade_size_percent, period, overbought, oversold):
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df['rsi'] = calculate_rsi(df['price'], period)

    df['signal'] = 0
    df.loc[df['rsi'] < oversold, 'signal'] = 1  # Buy signal
    df.loc[df['rsi'] > overbought, 'signal'] = -1  # Sell signal
    df['positions'] = df['signal'].diff()

    return execute_trades(df, initial_capital, max_trade_size_percent, period, overbought, oversold)


def execute_trades(df, initial_capital, max_trade_size_percent, period=14, overbought=70, oversold=30):
    capital = initial_capital
    current_investment = 0
    pnl = 0
    num_trades = 0
    wins = 0

    for index, row in df.iterrows():
        max_trade_size = capital * max_trade_size_percent / 100
        if row['signal'] == 1 and current_investment == 0:  # Buy signal
            units_to_buy = max_trade_size / row['price']
            capital -= units_to_buy * row['price']
            current_investment = units_to_buy
            num_trades += 1
        elif row['signal'] == -1 and current_investment > 0:  # Sell signal
            capital += current_investment * row['price']
            trade_pnl = (current_investment * row['price']) - (current_investment * df.at[df.index[df.index.get_loc(index) - 1], 'price'])
            pnl += trade_pnl
            if trade_pnl > 0:
                wins += 1
            current_investment = 0

    losses = num_trades - wins
    win_loss_ratio = wins / losses if losses > 0 else 'infinite'

    return {
            "strategy_type": "RSI",
            "parameters": {
                "period": period,
                "overbought": overbought,
                "oversold": oversold,
                "initial_capital": initial_capital,
                "max_trade_size_percent": max_trade_size_percent
            },
            # existing returned values
            "pnl": pnl,
            "numTrades": num_trades,
            "winLossRatio": win_loss_ratio,
            "finalCapital": capital
        }