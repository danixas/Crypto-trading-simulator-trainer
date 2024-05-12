import os
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, MinMaxScaler
from sklearn.model_selection import train_test_split
import joblib
import requests

def get_historical_data(coin_id, days):
    url = f"http://localhost:8000/api/crypto/fetch_historical_data/"
    params = {'coin_id': coin_id, 'days': days}
    response = requests.get(url, params=params)
    return response.json() if response.status_code == 200 else None

def first_process(data):
    df = pd.DataFrame(data)
    df = df[df['granularity'] == 'hourly']
    df = df.drop_duplicates(subset='timestamp')
    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
    df = df[df['timestamp'].notna()]
    df = df.sort_values(by='timestamp')
    return df

def classify(price_change, threshold=0.01):
    if price_change > threshold:
        return 'buy'
    elif price_change < -threshold:
        return 'sell'
    else:
        return 'stand'

def train_model(strategy_name, coin_id, initial_capital, max_trade_size_percent, user_id):
    data = get_historical_data(coin_id, 90)
    if data is None:
        raise ValueError("Failed to fetch data")

    df = first_process(data)
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    df['future_price'] = df['price'].shift(-1)
    df['price_change'] = (df['future_price'] - df['price']) / df['price']
    df['label'] = df['price_change'].apply(classify)

    window_size = 5
    X = np.array([df['price'].values[i:(i + window_size)] for i in range(len(df) - window_size)])
    labels = df['label'].iloc[window_size:].values

    label_encoder = LabelEncoder()
    Y = label_encoder.fit_transform(labels)
    onehot_encoder = OneHotEncoder()
    Y = onehot_encoder.fit_transform(Y.reshape(-1, 1)).toarray()

    scaler = MinMaxScaler(feature_range=(0, 1))
    X_scaled = scaler.fit_transform(X.reshape(-1, 1))
    X_scaled = X_scaled.reshape(-1, window_size, 1)
    X_train, X_test, Y_train, Y_test = train_test_split(X_scaled, Y, test_size=0.2, random_state=42)

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X_train.shape[1], X_train.shape[2])),
        tf.keras.layers.LSTM(50),
        tf.keras.layers.Dense(3, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    model.fit(X_train, Y_train, epochs=20, validation_data=(X_test, Y_test))

    # Saving the model and components
    model_dir = os.path.join('models', f'user_{user_id}', f'strategy_{strategy_name}')
    os.makedirs(model_dir, exist_ok=True)
    model.save(os.path.join(model_dir, f'{strategy_name}.keras'))
    joblib.dump(scaler, os.path.join(model_dir, 'scaler.gz'))
    joblib.dump(label_encoder, os.path.join(model_dir, 'label_encoder.gz'))
    joblib.dump(X_test, os.path.join(model_dir, 'X_test.gz'))
    joblib.dump(Y_test, os.path.join(model_dir, 'Y_test.gz'))
    joblib.dump(df['price'].iloc[-len(X_test):].values, os.path.join(model_dir, 'test_prices.gz'))

    return {
        "model_path": os.path.join(model_dir, f'{strategy_name}.keras'),
        "scaler_path": os.path.join(model_dir, 'scaler.gz'),
        "label_encoder_path": os.path.join(model_dir, 'label_encoder.gz'),
        "X_test_path": os.path.join(model_dir, 'X_test.gz'),
        "Y_test_path": os.path.join(model_dir, 'Y_test.gz'),
        "test_prices_path": os.path.join(model_dir, 'test_prices.gz')
    }

