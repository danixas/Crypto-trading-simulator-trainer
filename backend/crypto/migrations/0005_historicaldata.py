# Generated by Django 3.2.25 on 2024-04-18 23:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crypto', '0004_bitcoinlive'),
    ]

    operations = [
        migrations.CreateModel(
            name='HistoricalData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('coin_id', models.CharField(max_length=50)),
                ('date', models.DateTimeField()),
                ('price', models.FloatField()),
                ('market_cap', models.FloatField()),
                ('total_volume', models.FloatField()),
            ],
        ),
    ]
