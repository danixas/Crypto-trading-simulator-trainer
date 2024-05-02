
from django.contrib.auth.models import User

from django.test import TestCase

from strategies.models import Strategy


class StrategyModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.strategy = Strategy.objects.create(
            user=self.user,
            name='Test Strategy',
            conditions={'condition1': True, 'condition2': False}
        )

    def test_strategy_creation(self):
        self.assertEqual(self.strategy.user, self.user)
        self.assertEqual(self.strategy.name, 'Test Strategy')
        self.assertEqual(self.strategy.conditions, {'condition1': True, 'condition2': False})

    def test_strategy_string_representation(self):
        expected_string = 'Test Strategy by testuser'
        self.assertEqual(str(self.strategy), expected_string)