import numpy as np
import os
import joblib
import tensorflow as tf

def load_model_components(user_id, strategy_name):
    model_dir = os.path.join('models', f'user_{user_id}', f'strategy_{strategy_name}')
    model = tf.keras.models.load_model(os.path.join(model_dir, f'{strategy_name}.keras'))
    scaler = joblib.load(os.path.join(model_dir, 'scaler.gz'))
    label_encoder = joblib.load(os.path.join(model_dir, 'label_encoder.gz'))
    X_test = joblib.load(os.path.join(model_dir, 'X_test.gz'))
    test_prices = joblib.load(os.path.join(model_dir, 'test_prices.gz'))
    return model, scaler, label_encoder, X_test, test_prices

def simulate_trading(predictions, test_prices, initial_capital=10000, max_trade_size_percent=10):
    predicted_actions = np.argmax(predictions, axis=1)
    capital = initial_capital
    position = 0
    trades = []
    trade_prices = []

    for i, action in enumerate(predicted_actions):
        current_price = test_prices[i]
        if action == 0 and position == 0:  # Assume '0' is 'buy'
            amount_to_invest = (capital * max_trade_size_percent) / 100
            position = amount_to_invest / current_price
            capital -= amount_to_invest
            trades.append('buy')
            trade_prices.append(current_price)
        elif action == 1 and position > 0:  # Assume '1' is 'sell'
            capital += position * current_price
            position = 0
            trades.append('sell')
            trade_prices.append(current_price)

    final_capital = capital + (position * test_prices[-1] if position > 0 else 0)
    profit_loss = final_capital - initial_capital
    number_of_trades = len(trades)
    win_trades = sum(1 for i in range(1, len(trade_prices)) if trade_prices[i] > trade_prices[i-1] and trades[i-1] == 'sell')
    loss_trades = sum(1 for i in range(1, len(trade_prices)) if trade_prices[i] < trade_prices[i-1] and trades[i-1] == 'sell')
    win_loss_ratio = win_trades / loss_trades if loss_trades > 0 else 'Infinity'

    return {
            "strategy_type": "ML",
            "parameters": {
                "initial_capital": initial_capital,
                "max_trade_size_percent": max_trade_size_percent
            },
            "pnl": profit_loss,
            "numTrades": number_of_trades,
            "winLossRatio": win_loss_ratio,
            "finalCapital": capital
        }


def simulate_trading_live(df, model, scaler, label_encoder, initial_capital=10000, max_trade_size_percent=10):
    model = model
    # Preprocess data
    if 'price' in df.columns:
        df['scaled_price'] = scaler.transform(df[['price']])
    else:
        raise ValueError("Price column missing from DataFrame")

    X = np.array([df['scaled_price'].values[i:(i + 5)] for i in range(len(df) - 5)])  # Assuming a window size of 5
    X = X.reshape(X.shape[0], 5, 1)  # Reshape for LSTM input

    # Predict actions
    predictions = model.predict(X)
    predicted_actions = np.argmax(predictions, axis=1)

    # Simulate trading
    capital = initial_capital
    position = 0
    trades = []
    trade_prices = []
    timestamps = df['timestamp'].values[5:]  # Corresponding timestamps for X

    for i, action in enumerate(predicted_actions):
        current_price = df.iloc[i + 5]['price']  # Price corresponding to the window's end
        if action == 0 and position == 0:  # '0' is 'buy'
            amount_to_invest = (capital * max_trade_size_percent) / 100
            position = amount_to_invest / current_price
            capital -= amount_to_invest
            trades.append(('buy', timestamps[i]))
            trade_prices.append(current_price)
        elif action == 1 and position > 0:  # '1' is 'sell'
            capital += position * current_price
            position = 0
            trades.append(('sell', timestamps[i]))
            trade_prices.append(current_price)

    final_capital = capital + (position * df.iloc[-1]['price'] if position > 0 else 0)
    profit_loss = final_capital - initial_capital
    number_of_trades = len(trades)
    win_trades = sum(1 for i in range(1, len(trade_prices)) if trade_prices[i] > trade_prices[i-1] and trades[i-1][0] == 'sell')
    loss_trades = sum(1 for i in range(1, len(trade_prices)) if trade_prices[i] < trade_prices[i-1] and trades[i-1][0] == 'sell')
    win_loss_ratio = win_trades / loss_trades if loss_trades > 0 else 'Infinity'

    # Generate signals in the expected format
    signals = [(timestamp.strftime('%Y-%m-%d %H:%M:%S'), action) for action, timestamp in trades]

    return {
        "strategy_type": "ML",
        "parameters": {
            "initial_capital": initial_capital,
            "max_trade_size_percent": max_trade_size_percent
        },
        "pnl": profit_loss,
        "numTrades": number_of_trades,
        "winLossRatio": win_loss_ratio,
        "finalCapital": final_capital,
        "signals": signals
    }