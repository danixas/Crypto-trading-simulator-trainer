import numpy as np
import pandas as pd

#def calculate(prices, span):
#    return prices.ewm(span=span, adjust=False).mean()

def calculate(df, short_span, long_span, initial_capital, max_trade_size_percent):
    df['short_ema'] = df['price'].ewm(span=short_span, adjust=False)
    #calculate(df['price'], short_span)
    df['long_ema'] = df['price'].ewm(span=long_span, adjust=False)
    #calculate(df['price'], long_span)
    df['signal'] = np.where(df['short_ema'] > df['long_ema'], 1, -1)
    df['positions'] = df['signal'].diff()
    return execute_trades(df, initial_capital, max_trade_size_percent)

def execute_trades(data, initial_capital, max_trade_size_percent):
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
        elif row['positions'] == -1 and current_investment > 0:  # Sell signal
            capital += current_investment * row['price']
            trade_pnl = (current_investment * row['price']) - (current_investment * data.at[data.index[data.index.get_loc(index) - 1], 'price'])
            pnl += trade_pnl
            if trade_pnl > 0:
                wins += 1
            current_investment = 0

    losses = num_trades - wins
    win_loss_ratio = wins / losses if losses > 0 else 'infinite'

    return {"pnl": pnl, "numTrades": num_trades, "winLossRatio": win_loss_ratio, "finalCapital": capital}