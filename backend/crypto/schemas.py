from ninja import Schema
from datetime import datetime
from typing import Optional

class TradeSchema(Schema):
    crypto: str
    amount: float
    type: str
    price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

class HistoricalDataRequest(Schema):
    coin_id: str
    days: int

class HistoricalPriceSchema(Schema):
    timestamp: datetime
    price: float
    market_cap: Optional[float] = None
    total_volume: Optional[float] = None

class CloseTradeSchema(Schema):
    price: float
