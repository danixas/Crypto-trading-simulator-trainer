from django.test import TestCase
from unittest.mock import patch
import pandas as pd
from strategies.views import backtest_mac
from django.contrib.auth.models import User

class StrategyViewTests(TestCase):
    def setUp(self):
        self.register_url = '/api/users/register/'  # Directly use the API endpoint
        self.login_url = '/api/users/login/'
        self.user_data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        User.objects.create_user(**self.user_data)
        self.url = '/api/strategies/backtest/mac/'

    @patch('strategies.views.fetch_historical_data')
    def test_backtest_mac(self, mock_fetch):
        # Create a mock DataFrame with hourly data for 7 days
        periods = 7 * 24  # 7 days, 24 hours each
        data = {
            'timestamp': pd.date_range(start='20/4/2024', periods=periods, freq='h'),
            'price': [60000 + i * 0.5 for i in range(periods)]  # incremental close prices
        }
        df = pd.DataFrame(data)
        mock_fetch.return_value = df

        # Define the post data for the backtest
        post_data = {
            "coin": "bitcoin",
            "strategy_name": "MAC Strategy",
            "date_range": 7,
            "initial_capital": 10000,
            "max_trade_size_percent": 10,
            "short_term": 12,
            "long_term": 26
        }

        # Convert post_data to JSON before sending (if required)
        response = self.client.post(self.url, post_data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        mock_fetch.assert_called_once_with("bitcoin", 7)  # Ensure the mock was called correctly

    @patch('strategies.views.fetch_historical_data')
    def test_backtest_rsi(self, mock_fetch):
        # Create a mock DataFrame with hourly data for 7 days
        periods = 7 * 24  # 7 days, 24 hours each
        data = {
            'timestamp': pd.date_range(start='20/4/2024', periods=periods, freq='h'),
            'price': [60000 + i * 0.5 for i in range(periods)]  # incremental close prices
        }
        df = pd.DataFrame(data)
        mock_fetch.return_value = df

        # Define the post data for the backtest
        post_data = {
            "coin": "bitcoin",
            "strategy_name": "RSI Strategy",
            "date_range": 7,
            "initial_capital": 10000,
            "max_trade_size_percent": 10,
            "period": 14,
            "overbought": 70,
            "oversold": 30
        }

        # Convert post_data to JSON before sending (if required)
        response = self.client.post('/api/strategies/backtest/rsi/', post_data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        mock_fetch.assert_called_once_with("bitcoin", 7)  # Ensure the mock was called correctly


    @patch('strategies.views.fetch_historical_data')
    def test_backtest_ema(self, mock_fetch):
        # Create a mock DataFrame with hourly data for 7 days
        periods = 7 * 24  # 7 days, 24 hours each
        data = {
            'timestamp': pd.date_range(start='20/4/2024', periods=periods, freq='h'),
            'price': [60000 + i * 0.5 for i in range(periods)]  # incremental close prices
        }
        df = pd.DataFrame(data)
        mock_fetch.return_value = df

        # Define the post data for the backtest
        post_data = {
            "coin": "bitcoin",
            "strategy_name": "RSI Strategy",
            "date_range": 7,
            "initial_capital": 10000,
            "max_trade_size_percent": 10,
            "short_term": 12,
            "long_term": 26
        }

        # Convert post_data to JSON before sending (if required)
        response = self.client.post('/api/strategies/backtest/ema/', post_data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        mock_fetch.assert_called_once_with("bitcoin", 7)  # Ensure the mock was called correctly

    def test_list_strategies(self):
        login_response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'testpassword123'
        }, content_type='application/json')
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json().get('access')
        # Use the token to update the balance
        response = self.client.get('/api/strategies/list/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 200)
        #self.assertEqual(len(response.json()), 2)