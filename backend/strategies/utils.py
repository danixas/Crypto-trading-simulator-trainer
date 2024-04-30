from crypto.models import HistoricalPrice
import numpy as np
import pandas as pd
import pytz

def fetch_historical_data(coin, date_range):
    end_date = pd.Timestamp.now(tz=pytz.UTC)
    start_date = end_date - pd.Timedelta(days=date_range)
    granularity = 'hourly' if date_range > 1 else '5min'
    data = HistoricalPrice.objects.filter(
        timestamp__range=(start_date, end_date),
        symbol__iexact=coin,
        granularity=granularity
    ).order_by('timestamp')
    df = pd.DataFrame(list(data.values('timestamp', 'price')))
    df['timestamp'] = pd.to_datetime(df['timestamp']).dt.tz_localize(None).dt.tz_localize(pytz.UTC)
    df['price'] = pd.to_numeric(df['price'], errors='coerce')
    print(f"Data fetched with {len(df)} entries.")
    return df