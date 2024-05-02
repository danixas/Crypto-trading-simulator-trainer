from ninja import Schema
from typing import Optional, Dict, Any

class StrategySchema(Schema):
    id: int
    name: str
    conditions: Dict[str, Any]
    user_id: Optional[int] = None
    
class BacktestMACSchema(Schema):
    coin: str
    strategy_name: str
    date_range: int
    initial_capital: float
    max_trade_size_percent: float
    short_term: int
    long_term: int

class BacktestEMASchema(Schema):
    coin: str
    strategy_name: str
    date_range: int
    initial_capital: float
    max_trade_size_percent: float
    short_term: int
    long_term: int

class BacktestRSISchema(Schema):
    coin: str
    strategy_name: str
    date_range: int
    initial_capital: float
    max_trade_size_percent: float
    period: int
    overbought: int
    oversold: int