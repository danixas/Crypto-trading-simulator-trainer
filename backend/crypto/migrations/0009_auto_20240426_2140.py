# Generated by Django 3.2.25 on 2024-04-26 18:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crypto', '0008_auto_20240419_1532'),
    ]

    operations = [
        migrations.AddField(
            model_name='transaction',
            name='stop_loss',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.AddField(
            model_name='transaction',
            name='take_profit',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
    ]
