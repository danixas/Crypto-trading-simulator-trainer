from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import JSONField

class Strategy(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='strategies', null=True, blank=True)
    name = models.CharField(max_length=100)
    conditions = JSONField()

    def __str__(self):
        return f'{self.name} by {self.user.username if self.user else "System"}'
