# Generated by Django 3.2.25 on 2024-05-02 09:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_auto_20240419_1532'),
    ]

    operations = [
        migrations.RenameField(
            model_name='trade',
            old_name='amount',
            new_name='amount_usd',
        ),
    ]
