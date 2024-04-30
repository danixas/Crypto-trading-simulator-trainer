from django.contrib import admin
from .models import HistoricalPrice

@admin.register(HistoricalPrice)
class HistoricalPriceAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'price')
    list_filter = ('timestamp',)
    search_fields = ('timestamp', 'price')