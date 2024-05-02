from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import JSONField

class Transaction(models.Model):
    TYPE_CHOICES = (
        ('buy', 'Buy'),
        ('sell', 'Sell'),
        ('close', 'Close')
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(max_length=5, choices=TYPE_CHOICES)
    crypto = models.CharField(max_length=50)
    amount = models.FloatField()
    entry_price = models.FloatField(default=0.0)
    exit_price = models.FloatField(null=True, blank=True)
    stop_loss = models.FloatField(null=True, blank=True)
    take_profit = models.FloatField(null=True, blank=True)
    is_open = models.BooleanField(default=True)
    pnl = models.FloatField(default=0)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} {self.type} {self.amount} {self.crypto} at {self.entry_price}, PnL: {self.pnl}'

class HistoricalPrice(models.Model):
    symbol = models.CharField(max_length=10, default='BTC')
    timestamp = models.DateTimeField()
    price = models.DecimalField(max_digits=20, decimal_places=8)
    market_cap = models.DecimalField(max_digits=20, decimal_places=2, null=True)
    total_volume = models.DecimalField(max_digits=20, decimal_places=2, null=True)
    granularity = models.CharField(max_length=10, choices=[('hourly', 'Hourly'), ('5min', 'Five Minutes')], default='hourly')
    def __str__(self):
        return f"{self.symbol} {self.timestamp} - Price: {self.price} - Granularity: {self.granularity}"

class Cryptocurrency(models.Model):
    coin_id = models.CharField(max_length=100, unique=True)
    symbol = models.CharField(max_length=100)
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name} ({self.symbol.upper()})"