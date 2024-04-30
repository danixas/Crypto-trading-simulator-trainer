from typing import List
from django.shortcuts import get_list_or_404
from ninja import Router
from django.http import JsonResponse
from .models import Strategy
from .schemas import BacktestSchema, StrategySchema
from .utils import fetch_historical_data
from .strategies.mac_strategy import calculate as calculate_mac
from .strategies.ema_strategy import calculate as calculate_ema
from backend.authentication import JWTAuth

# Import other strategies similarly

strategy_router = Router()

@strategy_router.post('backtest/', response={200: dict})
def backtest_strategy(request, data: BacktestSchema):
    df = fetch_historical_data(data.coin, data.date_range)
    if df.empty:
        return JsonResponse({"pnl": 0, "numTrades": 0, "winLossRatio": "n/a", "finalCapital": data.initial_capital}, safe=False)

    if data.strategy_name == 'MAC Strategy':
        result = calculate_mac(df, data.short_term, data.long_term, data.initial_capital, data.max_trade_size_percent)
    elif data.strategy_name == 'EMA Strategy':
        result = calculate_ema(df, data.short_term, data.long_term, data.initial_capital, data.max_trade_size_percent)
    # Add other strategies here

    return JsonResponse(result, safe=False)

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