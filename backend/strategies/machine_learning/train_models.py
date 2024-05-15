import numpy as np
import os
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.utils import class_weight
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
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    return df

def calculate_rsi(df, window=14):
    delta = df['price'].diff()
    gain = (delta.where(delta > 0, 0))
    loss = (-delta.where(delta < 0, 0))
    avg_gain = gain.rolling(window=window, min_periods=1).mean()
    avg_loss = loss.rolling(window=window, min_periods=1).mean()
    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    df['RSI'] = rsi.fillna(0)  # Fill NA RSI values with 0
    return df

def classify(price_change, threshold=0.01):
    if price_change > threshold:
        return 'buy'
    elif price_change < -threshold:
        return 'sell'
    else:
        return 'stand'

def train_model(strategy_name, coin_id, initial_capital, max_trade_size_percent, user_id, lstm_units=50):
    data = get_historical_data(coin_id, 90)
    if data is None:
        raise ValueError("Failed to fetch data")
    
    df = first_process(data)
    if df.empty:
        raise ValueError("Processed data frame is empty. Check data quality or availability.")
    
    df = calculate_rsi(df)
    df['future_price'] = df['price'].shift(-1)
    df['price_change'] = (df['future_price'] - df['price']) / df['price']
    df['label'] = df['price_change'].apply(classify)
    
    window_size = 5
    feature_columns = ['price', 'RSI']

    windowed_data = []
    labels = []
    for i in range(len(df) - window_size):
        window = df.iloc[i:i+window_size][feature_columns].values
        if window.shape[0] == window_size:
            windowed_data.append(window.flatten())
            labels.append(df['label'].iloc[i + window_size - 1])

    X = np.array(windowed_data)
    label_encoder = LabelEncoder()
    Y = label_encoder.fit_transform(labels)
    onehot_encoder = OneHotEncoder()
    Y = onehot_encoder.fit_transform(Y.reshape(-1, 1)).toarray()

    scaler = MinMaxScaler(feature_range=(0, 1))
    X_scaled = scaler.fit_transform(X)
    X_train, X_test, Y_train, Y_test = train_test_split(X_scaled, Y, test_size=0.2, random_state=42)

    class_weights = class_weight.compute_class_weight('balanced', classes=np.unique(Y_train.argmax(axis=1)), y=Y_train.argmax(axis=1))
    class_weight_dict = dict(enumerate(class_weights))

    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(X_train.shape[1],)),
        tf.keras.layers.Reshape((window_size, len(feature_columns))),
        tf.keras.layers.LSTM(lstm_units),
        tf.keras.layers.Dense(3, activation='softmax')
    ])
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    model.fit(X_train, Y_train, epochs=20, validation_data=(X_test, Y_test), class_weight=class_weight_dict)

    model_dir = os.path.join('models', f'user_{user_id}', f'strategy_{strategy_name}')
    os.makedirs(model_dir, exist_ok=True)
    model.save(os.path.join(model_dir, f'{strategy_name}.keras'))
    joblib.dump(scaler, os.path.join(model_dir, 'scaler.gz'))
    joblib.dump(label_encoder, os.path.join(model_dir, 'label_encoder.gz'))
    joblib.dump(X_test, os.path.join(model_dir, 'X_test.gz'))
    joblib.dump(Y_test, os.path.join(model_dir, 'Y_test.gz'))
    joblib.dump(X[-len(X_test):], os.path.join(model_dir, 'test_features.gz'))

    return {
        "model_path": os.path.join(model_dir, f'{strategy_name}.keras'),
        "scaler_path": os.path.join(model_dir, 'scaler.gz'),
        "label_encoder_path": os.path.join(model_dir, 'label_encoder.gz'),
        "X_test_path": os.path.join(model_dir, 'X_test.gz'),
        "Y_test_path": os.path.join(model_dir, 'Y_test.gz'),
        "test_features_path": os.path.join(model_dir, 'test_features.gz')
    }
