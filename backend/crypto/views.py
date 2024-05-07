import requests
from django.http import JsonResponse
from django.utils.timezone import make_aware
from datetime import datetime
from django.shortcuts import get_list_or_404, get_object_or_404
from ninja import Router
from .models import Cryptocurrency, HistoricalPrice, Transaction
from .schemas import TradeSchema, CloseTradeSchema, CryptocurrencySchema
from backend.authentication import JWTAuth
from django.utils.timezone import now, timedelta
from ninja import Query
import logging
from django.db import transaction as db_transaction 
from django.db.models import F
from users.models import UserProfile

logger = logging.getLogger(__name__)

crypto_router = Router()
auth_crypto_router = Router(auth=JWTAuth())
# Trading endpoint to handle both buy and sell actions
@auth_crypto_router.post('trade/', response={200: dict, 400: dict, 500: dict})
def trade(request, trade_data: TradeSchema):
    user = request.auth
    profile = get_object_or_404(UserProfile, user=user)
    crypto, amountUSD, trade_type, current_price = (
        trade_data.crypto, trade_data.amount, trade_data.type, trade_data.price)

    try:
        with db_transaction.atomic():
            if trade_type == 'buy':
                total_cost = amountUSD
                amountCrypto = total_cost / current_price if current_price else 0
                if profile.balance >= total_cost:
                    profile.balance -= total_cost
                    profile.profit_loss -= total_cost
                    profile.holdings[crypto] = profile.holdings.get(crypto, 0.0) + amountCrypto
                    profile.save()
                    transaction = Transaction.objects.create(
                        user=user, type='buy', crypto=crypto, amount=amountCrypto,
                        entry_price=current_price)
                    return JsonResponse({
                        'detail': 'Transaction successful',
                        'transactionId': transaction.id,
                        'amount': amountCrypto,
                        'price': current_price
                    }, status=200)
                else:
                    return JsonResponse({'detail': 'Insufficient balance'}, status=422)
            elif trade_type == 'sell':
                amountCrypto = amountUSD / current_price if current_price else 0
                profile.holdings[crypto] -= amountCrypto
                if profile.holdings[crypto] <= 0:
                    del profile.holdings[crypto]
                profile.save()
                transaction = Transaction.objects.create(
                    user=user, type='sell', crypto=crypto, amount=amountCrypto,
                    entry_price=current_price)
                return JsonResponse({
                    'detail': 'Transaction successful',
                    'transactionId': transaction.id,
                    'amount': amountCrypto,
                    'price': current_price
                }, status=200)

    except Exception as e:
        return JsonResponse({'detail': 'Internal Server Error', 'error': str(e)}, status=500)

@auth_crypto_router.post('close_trade/{transaction_id}/', response={200: dict, 400: dict, 422: dict})
def close_trade(request, transaction_id: int, data: CloseTradeSchema):
    try:
        user = request.auth
        profile = get_object_or_404(UserProfile, user=user)
        transaction = get_object_or_404(Transaction, id=transaction_id, user=user, is_open=True)
        transaction.exit_price = data.price

        total_value = transaction.exit_price * transaction.amount
        if transaction.type == 'buy':
            transaction.pnl = total_value - (transaction.entry_price * transaction.amount)
            profile.balance += total_value
            profile.profit_loss += total_value
        elif transaction.type == 'sell':
            transaction.pnl = (transaction.entry_price * transaction.amount) - total_value
            profile.balance += transaction.pnl
            profile.profit_loss += transaction.pnl

        profile.total_trades += 1
        transaction.is_open = False
        profile.save()
        transaction.save()
        return JsonResponse({'detail': 'Trade closed successfully', 'pnl': transaction.pnl, 'transactionId': transaction.id}, status=200)
    except Exception as e:
        return JsonResponse({'detail': 'Error closing trade', 'error': str(e)}, status=422)

@crypto_router.get('fetch_historical_data/')
def fetch_historical_data(request, coin_id: str = Query(...), days: int = Query(...)):
    try:
        end_date = now()
        start_date = end_date - timedelta(days=days)
        granularity = 'hourly' if days > 1 else '5min'
        historical_data = HistoricalPrice.objects.filter(
            symbol=coin_id,
            timestamp__range=[start_date, end_date],
            granularity=granularity
        ).order_by('timestamp')

        if not historical_data.exists() or historical_data.count() < expected_data_points(days):
            fetch_and_store_historical_data(coin_id, days)
            historical_data = HistoricalPrice.objects.filter(
                symbol=coin_id,
                timestamp__range=[start_date, end_date]
            ).order_by('timestamp')

        data = list(historical_data.values('timestamp', 'price'))
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

def expected_data_points(days):
    if days == 1:
        return 100  # 5-minute intervals in 24 hours
    return 24 * days  # Hourly intervals for more than one day

def fetch_and_store_historical_data(coin_id, days):
    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    params = {
        'vs_currency': 'usd',
        'days': days,
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        granularity = ''
        granularity = 'hourly' if days > 1 else '5min'
        for point in data['prices']:
            timestamp, price = point
            HistoricalPrice.objects.update_or_create(
                timestamp=make_aware(datetime.fromtimestamp(timestamp / 1000)),
                symbol=coin_id,
                defaults={'price': price},
                granularity=granularity
            )
    else:
        raise Exception("Failed to fetch data from CoinGecko")
    

@crypto_router.get('list/', response=list[CryptocurrencySchema])
def get_cryptocurrencies(request):
    return get_list_or_404(Cryptocurrency)

@crypto_router.post('fetch_cryptocurrencies/')
def fetch_cryptocurrencies(request):
    import requests
    url = 'https://api.coingecko.com/api/v3/coins/list'
    response = requests.get(url)
    if response.status_code == 200:
        cryptocurrencies = response.json()
        Cryptocurrency.objects.all().delete()
        for crypto in cryptocurrencies:
            Cryptocurrency.objects.create(
                coin_id=crypto['id'],
                symbol=crypto['symbol'],
                name=crypto['name']
            )
        return {"success": True, "message": "Cryptocurrencies updated."}
    else:
        return {"success": False, "message": "Failed to fetch data from CoinGecko."}