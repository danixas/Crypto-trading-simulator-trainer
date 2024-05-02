
from django.test import TestCase
from crypto.models import HistoricalPrice
from crypto.models import Cryptocurrency
from crypto.models import Transaction

from django.contrib.auth.models import User

class HistoricalPriceModelTest(TestCase):
    def setUp(self):
        self.historical_price = HistoricalPrice.objects.create(
            symbol='BTC',
            timestamp='2022-01-01 00:00:00',
            price=50000.0,
            market_cap=1000000000.0,
            total_volume=1000000.0,
            granularity='hourly'
        )

    def test_historical_price_creation(self):
        self.assertEqual(self.historical_price.symbol, 'BTC')
        self.assertEqual(str(self.historical_price.timestamp), '2022-01-01 00:00:00')
        self.assertEqual(self.historical_price.price, 50000.0)
        self.assertEqual(self.historical_price.market_cap, 1000000000.0)
        self.assertEqual(self.historical_price.total_volume, 1000000.0)
        self.assertEqual(self.historical_price.granularity, 'hourly')

    def test_historical_price_string_representation(self):
        expected_string = 'BTC 2022-01-01 00:00:00 - Price: 50000.0 - Granularity: hourly'
        self.assertEqual(str(self.historical_price), expected_string)

class CryptocurrencyModelTest(TestCase):
    def setUp(self):
        self.crypto = Cryptocurrency.objects.create(
            coin_id='btc',
            symbol='BTC',
            name='Bitcoin'
        )

    def test_crypto_creation(self):
        self.assertEqual(self.crypto.coin_id, 'btc')
        self.assertEqual(self.crypto.symbol, 'BTC')
        self.assertEqual(self.crypto.name, 'Bitcoin')

    def test_crypto_string_representation(self):
        expected_string = 'Bitcoin (BTC)'
        self.assertEqual(str(self.crypto), expected_string)

class TransactionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.transaction = Transaction.objects.create(
            user=self.user,
            type='buy',
            crypto='BTC',
            amount=1.5,
            entry_price=50000.0,
            exit_price=55000.0,
            stop_loss=48000.0,
            take_profit=60000.0,
            is_open=True,
            pnl=1000.0
        )

    def test_transaction_str_representation(self):
        expected_str = f'{self.user.username} buy 1.5 BTC at 50000.0, PnL: 1000.0'
        self.assertEqual(str(self.transaction), expected_str)

    def test_transaction_defaults(self):
        transaction = Transaction.objects.create(
            user=self.user,
            type='sell',
            crypto='ETH',
            amount=2.0
        )
        self.assertEqual(transaction.entry_price, 0.0)
        self.assertIsNone(transaction.exit_price)
        self.assertIsNone(transaction.stop_loss)
        self.assertIsNone(transaction.take_profit)
        self.assertTrue(transaction.is_open)
        self.assertEqual(transaction.pnl, 0.0)
