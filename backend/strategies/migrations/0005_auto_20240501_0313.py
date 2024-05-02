from django.db import migrations

def create_rsi_strategy(apps, schema_editor):
    Strategy = apps.get_model('strategies', 'Strategy')
    Strategy.objects.get_or_create(
        name='RSI Strategy',
        defaults={
            'conditions': {'period': 14, 'overbought': 70, 'oversold': 30}
        }
    )

class Migration(migrations.Migration):
    dependencies = [
        ('strategies', '0004_auto_20240430_1026'),
    ]

    operations = [
        migrations.RunPython(create_rsi_strategy),
    ]
