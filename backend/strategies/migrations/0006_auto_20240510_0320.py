# Generated by Django 3.2.25 on 2024-05-10 00:20

from django.db import migrations

def create_ml_strategy(apps, schema_editor):
    Strategy = apps.get_model('strategies', 'Strategy')
    Strategy.objects.get_or_create(
        name='ML Strategy',
        defaults={
            'conditions': {
                'coin_id': 'bitcoin',
                'initial_capital': 10000,
                'max_trade_size_percent': 10
            }
        }
    )

class Migration(migrations.Migration):

    dependencies = [
        ('strategies', '0005_auto_20240501_0313'),
    ]

    operations = [
        migrations.RunPython(create_ml_strategy),
    ]
