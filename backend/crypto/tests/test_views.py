
from django.test import TestCase
from unittest.mock import patch
import pandas as pd
from strategies.views import backtest_mac
from django.contrib.auth.models import User

class TestTradeView(TestCase):
    def setUp(self):
        self.register_url = '/api/users/register/'  # Directly use the API endpoint
        self.login_url = '/api/users/login/'
        self.user_data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        User.objects.create_user(**self.user_data)
 
    def test_trade(self):

        login_response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'testpassword123'
        }, content_type='application/json')
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json().get('access')
        response = self.client.post('/api/crypto/auth/trade/', 
                                    {'crypto': 'bitcoin',
                                     'amount': 1, 
                                     'type': 'buy', 
                                     'price': 1,
                                     }, content_type='application/json', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 200)
        #elf.assertEqual(response.data['amount'], 1)
        #self.assertEqual(response.data['price'], 1)
        #self.assertEqual(response.data['type'], 'buy')

    