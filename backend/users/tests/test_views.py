from django.test import TestCase
from django.contrib.auth.models import User
from users.models import UserProfile

class UserViewTest(TestCase):
    def setUp(self):
        self.register_url = '/api/users/register/'  # Directly use the API endpoint
        self.login_url = '/api/users/login/'
        self.user_data = {
            'username': 'testuser',
            'password': 'testpassword123'
        }
        User.objects.create_user(**self.user_data)

    def test_user_registration(self):
        response = self.client.post(self.register_url, {
            'username': 'newuser',
            'password': 'newpassword123'
        }, content_type='application/json')  # Ensure to set content_type to 'application/json'
        self.assertEqual(response.status_code, 201)

    def test_user_login(self):
        response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'testpassword123'
        }, content_type='application/json')
        self.assertEqual(response.status_code, 200)
    
    def test_user_profile_access(self):
        # Perform login to get the token
        login_response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'testpassword123'
        }, content_type='application/json')
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json().get('access')
        # Use the token to access the profile
        profile_url = '/api/users/profile/'
        response = self.client.get(profile_url, HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 200)

    def test_update_balance(self):
        # Perform login to get the token
        login_response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'testpassword123'
        }, content_type='application/json')
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json().get('access')
        # Use the token to update the balance
        update_balance_url = '/api/users/update_balance/'
        response = self.client.post(update_balance_url, {
            'balance': 10000
        }, content_type='application/json', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 200)
        # Verify the updated balance
        profile = UserProfile.objects.get(user__username='testuser')
        self.assertEqual(profile.balance, 10000)

'''
    def test_me(self):
        # Perform login to get the token
        login_response = self.client.post(self.login_url, {
            'username': 'testuser',
            'password': 'testpassword123'
        }, content_type='application/json')
        self.assertEqual(login_response.status_code, 200)
        token = login_response.json().get('access')
        # Use the token to get the user information
        me_url = '/api/users/me/'
        response = self.client.get(me_url, HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(response.status_code, 200)
'''