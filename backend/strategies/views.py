from typing import List
from django.shortcuts import get_list_or_404
from ninja import Query, Router
from django.http import JsonResponse
import pandas as pd
from crypto.models import HistoricalPrice
from .models import Strategy
from .schemas import BacktestMACSchema, BacktestEMASchema, BacktestRSISchema, BacktestMLSchema, StrategySchema, TrainMLInput, TrainMLOutput
from .strategies.mac_strategy import calculate as calculate_mac
from .strategies.ema_strategy import calculate as calculate_ema
from .strategies.rsi_strategy import calculate as calculate_rsi
from backend.authentication import JWTAuth
import pytz
import os
import joblib
from .machine_learning.train_models import train_model
from .machine_learning.predict_models import load_model_components, simulate_trading, simulate_trading_live

strategy_router = Router()


@strategy_router.post('/backtest/ml/', response={200: dict}, auth=JWTAuth())
def backtest_ml(request, data: BacktestMLSchema):
    print("strategy name sent to backtest ml:")
    print(data)
    user = request.auth
    user_id = user.id if user else None
    train_model(data.strategy_name, data.coin, data.initial_capital, data.max_trade_size_percent, user_id)
    model, scaler, label_encoder, X_test, test_prices = load_model_components(user_id, data.strategy_name)
    predictions = model.predict(X_test)
    simulation_results = simulate_trading(predictions, test_prices, data.initial_capital, data.max_trade_size_percent)

    return JsonResponse({**simulation_results, 'strategy_name': data.strategy_name}, safe=False)

@strategy_router.post('/live_backtest/ml/', response={200: dict}, auth=JWTAuth())
def live_backtest_ml(request, data: BacktestMLSchema):
    user = request.auth
    user_id = user.id if user else None
    model, scaler, label_encoder, X_test, test_prices = load_model_components(user_id, data.strategy_name)
    
    df = fetch_historical_data(data.coin, data.date_range)
    if df.empty:
        return JsonResponse({"message": "No data available for trading.", "pnl": 0, "numTrades": 0, "winLossRatio": "n/a", "finalCapital": data.initial_capital}, status=200)

    result = simulate_trading_live(df, model, scaler, label_encoder, data.initial_capital, data.max_trade_size_percent)
    return JsonResponse(result)

@strategy_router.post('backtest/mac/', response={200: dict})
def backtest_mac(request, data: BacktestMACSchema):
    df = fetch_historical_data(data.coin, data.date_range)
    if df.empty:
        return JsonResponse({"message": "No data available for trading.", "pnl": 0, "numTrades": 0, "winLossRatio": "n/a", "finalCapital": data.initial_capital}, status=200)
    result = calculate_mac(df, data.short_term, data.long_term, data.initial_capital, data.max_trade_size_percent)
    return JsonResponse({**result, 'strategy_name': data.strategy_name}, safe=False)

@strategy_router.post('live_backtest/mac/', response={200: dict})
def live_backtest_mac(request, data: BacktestMACSchema):
    df = fetch_historical_data(data.coin, data.date_range)
    if df.empty:
        return JsonResponse({"message": "No data available for trading.", "pnl": 0, "numTrades": 0, "winLossRatio": "n/a", "finalCapital": data.initial_capital}, status=200)
    result = calculate_mac(df, data.short_term, data.long_term, data.initial_capital, data.max_trade_size_percent)
    signals = []
    for index, row in df.iterrows():
        if row['positions'] == 1:
            signals.append((row['timestamp'], 'buy'))
        elif row['positions'] == -1:
            signals.append((row['timestamp'], 'sell'))
    signal_str = ', '.join([f"{signal_time} {signal_type}" for signal_time, signal_type in signals])
    return JsonResponse({**result, 'signals': signals}, safe=False)

@strategy_router.post('backtest/ema/', response={200: dict})
def backtest_ema(request, data: BacktestEMASchema):
    df = fetch_historical_data(data.coin, data.date_range)
    if df.empty:
        return JsonResponse({"message": "No data available for trading.", "pnl": 0, "numTrades": 0, "winLossRatio": "n/a", "finalCapital": data.initial_capital}, status=200)
    result = calculate_ema(df, data.short_term, data.long_term, data.initial_capital, data.max_trade_size_percent)
    return JsonResponse({**result, 'strategy_name': data.strategy_name}, safe=False)

@strategy_router.post('backtest/rsi/', response={200: dict})
def backtest_rsi(request, data: BacktestRSISchema):
    df = fetch_historical_data(data.coin, data.date_range)
    if df.empty:
        return JsonResponse({"message": "No data available for trading.", "pnl": 0, "numTrades": 0, "winLossRatio": "n/a", "finalCapital": data.initial_capital}, status=200)
    result = calculate_rsi(df, data.initial_capital, data.max_trade_size_percent, data.period, data.overbought, data.oversold)
    return JsonResponse({**result, 'strategy_name': data.strategy_name}, safe=False)

@strategy_router.post('live_backtest/rsi/', response={200: dict})
def live_backtest_rsi(request, data: BacktestRSISchema):
    df = fetch_historical_data(data.coin, data.date_range)
    if df.empty:
        return JsonResponse({"message": "No data available for trading.", "pnl": 0, "numTrades": 0, "winLossRatio": "n/a", "finalCapital": data.initial_capital}, status=200)
    result = calculate_rsi(df, data.initial_capital, data.max_trade_size_percent, data.period, data.overbought, data.oversold)
    signals = []
    for index, row in df.iterrows():
        if row['positions'] == 1:
            signals.append((row['timestamp'], 'buy'))
        elif row['positions'] == -1:
            signals.append((row['timestamp'], 'sell'))
    signal_str = ', '.join([f"{signal_time} {signal_type}" for signal_time, signal_type in signals])
    return JsonResponse({**result, 'signals': signals}, safe=False)

@strategy_router.get('list/', response=List[StrategySchema], auth=JWTAuth())
def list_strategies(request):
    strategies = get_list_or_404(Strategy)
    return [StrategySchema(id=s.id, name=s.name, conditions=s.conditions) for s in strategies]

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

    return {"pnl": pnl, "numTrades": num_trades, "winLossRatio": win_loss_ratio, "finalCapital": capital}


def fetch_historical_data(coin, date_range):
    end_date = pd.Timestamp.now(tz=pytz.UTC)
    start_date = end_date - pd.Timedelta(days=date_range)
    granularity = 'hourly' if date_range > 1 else '5min'
    data = HistoricalPrice.objects.filter(
        timestamp__range=(start_date, end_date),
        symbol__iexact=coin,
        granularity=granularity
    ).order_by('timestamp')
    df = pd.DataFrame(list(data.values('timestamp', 'price')))
    df['timestamp'] = pd.to_datetime(df['timestamp']).dt.tz_localize(None).dt.tz_localize(pytz.UTC)
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    print(f"Data fetched with {len(df)} entries.")
    return df