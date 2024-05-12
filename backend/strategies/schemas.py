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

class BacktestMLSchema(Schema):
    coin: str
    strategy_name: str
    date_range: int = 90
    initial_capital: float
    max_trade_size_percent: float


class TrainMLInput(Schema):
    user_id: int
    strategy_id: int
    coin_id: str = "bitcoin"
    initial_capital: float = 10000
    max_trade_size_percent: float = 10

class TrainMLOutput(Schema):
    strategy_type: str
    parameters: Dict[str, float]
    pnl: float
    numTrades: int
    winLossRatio: float
    finalCapital: float