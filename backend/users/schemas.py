from ninja import NinjaAPI, Schema
from datetime import datetime

class AuthSchema(Schema):
    username: str
    password: str

class TokenSchema(Schema):
    refresh: str
    access: str

class UserProfileSchema(Schema):
    #user_id: int = None  # Making it optional
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