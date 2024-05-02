from django.core.management.base import BaseCommand
from crypto.models import Cryptocurrency
import requests

class Command(BaseCommand):
    help = 'Fetches cryptocurrency list from CoinGecko and stores it in the database'

    def handle(self, *args, **kwargs):
        response = requests.get('https://api.coingecko.com/api/v3/coins/list')
        if response.status_code == 200:
            Cryptocurrency.objects.all().delete()  # Optional: clear the table first
            for crypto in response.json():
                Cryptocurrency.objects.create(
                    coin_id=crypto['id'],
                    symbol=crypto['symbol'],
                    name=crypto['name']
                )
            self.stdout.write(self.style.SUCCESS('Successfully updated cryptocurrency list.'))
        else:
            self.stdout.write(self.style.ERROR('Failed to fetch cryptocurrencies.'))
