from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    balance = models.FloatField(default=10000000.0)  # Default balance
    total_trades = models.IntegerField(default=0)
    profit_loss = models.FloatField(default=0.0)
    holdings = models.JSONField(default=dict)
    def __str__(self):
        return self.user.username

class Trade(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=10)
    amount = models.DecimalField(max_digits=10, decimal_places=10)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    coin_type = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.type} {self.amount} {self.coin_type}"
    

