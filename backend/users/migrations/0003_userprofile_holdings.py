# Generated by Django 3.2.25 on 2024-04-19 11:03

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_auto_20240419_0426'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='holdings',
            field=models.JSONField(default=dict),
        ),
    ]