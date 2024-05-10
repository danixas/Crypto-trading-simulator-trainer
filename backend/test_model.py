import numpy as np
import tensorflow as tf
import joblib
from sklearn.metrics import confusion_matrix, classification_report

# Load the previously saved model, scaler, and label encoder
model = tf.keras.models.load_model('crypto_trading_model.keras')
scaler = joblib.load('scaler.gz')
label_encoder = joblib.load('label_encoder.gz')

# Load test data and corresponding prices
X_test = joblib.load('X_test.gz')
X_train = joblib.load('X_train.gz')
Y_test = joblib.load('Y_test.gz')
Y_train = joblib.load('Y_train.gz')
test_prices = joblib.load('test_prices.gz')

# Make predictions with test data
predictions = model.predict(X_test)
predicted_actions = np.argmax(predictions, axis=1)
predicted_labels = [label_encoder.classes_[action] for action in predicted_actions]

# Initialize trading variables
capital = 10000  # Starting capital
position = 0  # Current position in BTC
trades = []
trade_prices = []

# Iterate over each test instance
for i, action in enumerate(predicted_labels):
    current_price = test_prices[i]
    if action == 'buy' and position == 0:  # Buy only if no position
        position = capital / current_price
        capital = 0
        trades.append('buy')
        trade_prices.append(current_price)
    elif action == 'sell' and position > 0:  # Sell only if there is a position
        capital = position * current_price
        position = 0
        trades.append('sell')
        trade_prices.append(current_price)

# Calculate final capital if holding BTC
if position > 0:
    capital = position * test_prices[-1]
    position = 0

# Compute trading statistics
initial_capital = 10000
final_capital = capital
profit_loss = final_capital - initial_capital
number_of_trades = len(trades)
win_trades = sum(1 for i in range(1, len(trade_prices)) if trade_prices[i] > trade_prices[i-1] and trades[i-1] == 'sell')
loss_trades = sum(1 for i in range(1, len(trade_prices)) if trade_prices[i] < trade_prices[i-1] and trades[i-1] == 'sell')
win_loss_ratio = win_trades / loss_trades if loss_trades > 0 else float('inf')

print(f"Final Capital: ${final_capital:.2f}")
print(f"Profit/Loss: ${profit_loss:.2f}")
print(f"Win/Loss Ratio: {win_loss_ratio:.2f}")
print(f"Number of Trades: {number_of_trades}")

Y_train_labels = Y_train.argmax(axis=1)
Y_test_labels = Y_test.argmax(axis=1)

# Now you can safely use label_encoder.inverse_transform
print(np.unique(label_encoder.inverse_transform(Y_train_labels), return_counts=True))
print(np.unique(label_encoder.inverse_transform(Y_test_labels), return_counts=True))

# Predict using the model
test_preds = model.predict(X_test)
test_preds_labels = np.argmax(test_preds, axis=1)

# Generate confusion matrix and classification report
print(confusion_matrix(Y_test_labels, test_preds_labels))
print(classification_report(Y_test_labels, test_preds_labels))