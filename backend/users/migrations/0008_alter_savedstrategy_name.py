# Generated by Django 3.2.25 on 2024-05-11 16:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0007_savedstrategy'),
    ]

    operations = [
        migrations.AlterField(
            model_name='savedstrategy',
            name='name',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]
