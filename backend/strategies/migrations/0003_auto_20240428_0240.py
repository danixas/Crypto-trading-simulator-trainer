from django.db import migrations

def create_predefined_strategies(apps, schema_editor):
    Strategy = apps.get_model('strategies', 'Strategy')
    Strategy.objects.get_or_create(
        name='MAC Strategy',
        defaults={
            'conditions': {'short_term': 5, 'long_term': 20, 'indicator': 'SMA'}
        }
    )

class Migration(migrations.Migration):
    dependencies = [
        ('strategies', '0002_alter_strategy_user'),
    ]

    operations = [
        migrations.RunPython(create_predefined_strategies),
    ]
