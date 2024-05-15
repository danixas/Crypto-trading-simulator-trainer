import numpy as np
import os
import joblib
import tensorflow as tf
import pandas as pd

def load_model_components(user_id, strategy_name):
    model_dir = os.path.join('models', f'user_{user_id}', f'strategy_{strategy_name}')
    model = tf.keras.models.load_model(os.path.join(model_dir, f'{strategy_name}.keras'))
    scaler = joblib.load(os.path.join(model_dir, 'scaler.gz'))
    label_encoder = joblib.load(os.path.join(model_dir, 'label_encoder.gz'))
    X_test = joblib.load(os.path.join(model_dir, 'X_test.gz'))
    test_features = joblib.load(os.path.join(model_dir, 'test_features.gz'))
    return model, scaler, label_encoder, X_test, test_features

def calculate_rsi(df, window=14):
    delta = df['price'].diff()
    gain = (delta.where(delta > 0, 0))
    loss = (-delta.where(delta < 0, 0))
    avg_gain = gain.rolling(window=window, min_periods=window).mean()
    avg_loss = loss.rolling(window=window, min_periods=window).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.fillna(0)

def simulate_trading(predictions, test_features, initial_capital=10000, max_trade_size_percent=10):
    predicted_actions = np.argmax(predictions, axis=1)
    capital = initial_capital
    position = 0
    trades = []

    for i, action in enumerate(predicted_actions):
        current_price = test_features[i][0]  # Assuming price is the first column in test_features
        if action == 0 and position == 0:  # '0' is 'buy'
            amount_to_invest = (capital * max_trade_size_percent) / 100
            position = amount_to_invest / current_price
            capital -= amount_to_invest
            trades.append('buy')
        elif action == 1 and position > 0:  # '1' is 'sell'
            capital += position * current_price
            position = 0
            trades.append('sell')

    final_capital = capital + (position * test_features[-1][0] if position > 0 else 0)
    profit_loss = final_capital - initial_capital
    number_of_trades = len(trades)
    win_trades = sum(1 for i in range(1, len(trades)) if trades[i] == 'sell')
    loss_trades = number_of_trades - win_trades
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
        "finalCapital": final_capital
    }

def simulate_trading_live(df, model, scaler, label_encoder, initial_capital=10000, max_trade_size_percent=10):
    df['RSI'] = calculate_rsi(df)
    if 'price' not in df.columns or 'RSI' not in df.columns:
        raise ValueError("Required columns are missing from DataFrame")

    # Prepare the feature array by stacking price and RSI
    feature_array = np.column_stack([df['price'], df['RSI']])
    window_size = 5

    # Ensure data is windowed correctly
    if len(df) < window_size:
        raise ValueError(f"Data must have at least {window_size} entries for windowing")

    # Create a rolling window of features
    rolled_features = np.lib.stride_tricks.sliding_window_view(feature_array, window_shape=(window_size, 2)).reshape(-1, window_size * 2)

    # Scale the features
    scaled_features = scaler.transform(rolled_features)  # Ensure correct shape for scaling

    # Predict actions
    predictions = model.predict(scaled_features)  # Reshape is not needed if model expects 2D input
    predicted_actions = np.argmax(predictions, axis=1)

    # Simulate trading based on predicted actions
    capital = initial_capital
    position = 0
    trades = []
    timestamps = df['timestamp'][window_size - 1:].reset_index(drop=True)  # Correct index to match window offset

    for i, action in enumerate(predicted_actions):
        current_price = df.iloc[i + window_size - 1]['price']
        timestamp = timestamps[i].to_pydatetime().isoformat()
        if action == 0 and position == 0:  # '0' is 'buy'
            amount_to_invest = (capital * max_trade_size_percent) / 100
            position = amount_to_invest / current_price
            capital -= amount_to_invest
            trades.append([timestamp, 'buy'])
        elif action == 1 and position > 0:  # '1' is 'sell'
            capital += position * current_price
            position = 0
            trades.append([timestamp, 'sell'])

    final_capital = capital + (position * df.iloc[-1]['price'] if position > 0 else 0)
    profit_loss = final_capital - initial_capital
    number_of_trades = len(trades)
    win_trades = sum(1 for i in range(1, len(trades)) if trades[i-1][1] == 'sell')
    loss_trades = number_of_trades - win_trades
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
        "finalCapital": final_capital,
        "signals": trades
    }
