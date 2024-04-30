from django.contrib import admin
from .models import Strategy

class StrategyAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_user', 'conditions')
    list_filter = ('user',)
    search_fields = ('name', 'user__username')

    def display_user(self, obj):
        return obj.user.username if obj.user else "System"
    display_user.short_description = 'User'

admin.site.register(Strategy, StrategyAdmin)
