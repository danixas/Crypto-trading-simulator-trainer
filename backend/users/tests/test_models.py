from django.shortcuts import get_object_or_404
from django.test import TestCase
from users.models import UserProfile

from django.test import TestCase
from django.contrib.auth.models import User
from users.models import UserProfile

class UserProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.user_profile = get_object_or_404(UserProfile, user=self.user)
        
    def test_user_profile_creation(self):
        self.assertEqual(self.user_profile.user, self.user)
        self.assertEqual(self.user_profile.balance, 10000000.0)
        self.assertEqual(self.user_profile.total_trades, 0)
        self.assertEqual(self.user_profile.profit_loss, 0.0)
        self.assertEqual(self.user_profile.holdings, {})

    def test_user_profile_string_representation(self):
        self.assertEqual(str(self.user_profile), 'testuser')

def test_user_profile_creation(self):
    user = User.objects.create_user(username='testuser', password='testpassword')
    user_profile = UserProfile.objects.create(user=user)
    assert user_profile.user == user
    assert user_profile.balance == 10000000.0
    assert user_profile.total_trades == 0
    assert user_profile.profit_loss == 0.0
    assert user_profile.holdings == {}
