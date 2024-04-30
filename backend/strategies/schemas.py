from ninja import Schema
from typing import Optional, Dict, Any

class StrategySchema(Schema):
    id: int
    name: str
    conditions: Dict[str, Any]
    user_id: Optional[int] = None
    
class BacktestSchema(Schema):
    coin: str
    strategy_name: str
    short_term: int
    long_term: int
    date_range: int
    initial_capital: float
    max_trade_size_percent: float
    