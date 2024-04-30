from django.db import migrations

def create_ema_strategy(apps, schema_editor):
    Strategy = apps.get_model('strategies', 'Strategy')
    Strategy.objects.get_or_create(
        name='EMA Strategy',
        defaults={
            'conditions': {'short_span': 12, 'long_span': 26, 'indicator': 'EMA'}
        }
    )

class Migration(migrations.Migration):
    dependencies = [
        ('strategies', '0003_auto_20240428_0240'),
    ]

    operations = [
        migrations.RunPython(create_ema_strategy),
    ]
