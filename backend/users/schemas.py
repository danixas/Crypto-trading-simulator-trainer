from ninja import NinjaAPI, Schema
from datetime import datetime
from typing import Optional

class AuthSchema(Schema):
    username: str
    password: str

class TokenSchema(Schema):
    refresh: str
    access: str

class UserProfileSchema(Schema):
    user: str
    balance: float
    total_trades: int
    profit_loss: float

class TradeSchema(Schema):
    timestamp: datetime
    type: str
    amount: float
    price: float
    coin_type: str

class RegistrationSchema(Schema):
    username: str
    password: str

class MessageSchema(Schema):
    message: str

class UpdateBalanceSchema(Schema):
    balance: float

class TransactionSchema(Schema):
    type: str
    crypto: str
    amount: float
    entry_price: float
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    is_open: bool
    pnl: float
    date: str

    @classmethod
    def from_orm(cls, obj):
        return cls(
            id=obj.id,
            type=obj.type,
            crypto=obj.crypto,
            amount=obj.amount,
            entry_price=obj.entry_price,
            exit_price=obj.exit_price,
            stop_loss=obj.stop_loss,
            take_profit=obj.take_profit,
            is_open=obj.is_open,
            pnl=obj.pnl,
            date=obj.date.isoformat() if obj.date else None
        )


class SavedStrategySchema(Schema):
    strategy_name: str
    strategy_type: str
    parameters: dict
    
    @classmethod
    def from_orm(cls, obj):
        return cls(
            strategy_name=obj.name,
            strategy_type=obj.strategy_type,
            parameters=obj.parameters
        )