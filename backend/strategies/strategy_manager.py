from .strategies import ema_strategy, mac_strategy
from .utils import fetch_historical_data

def execute_strategy(strategy_name, data, **params):
    if strategy_name == 'EMA':
        return ema_strategy.strategy_logic(data, **params)
    elif strategy_name == 'MAC':
        return mac_strategy.strategy_logic(data, **params)
    # Add other strategies here
    else:
        raise ValueError("Unknown strategy")
