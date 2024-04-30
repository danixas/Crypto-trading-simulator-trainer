from django.apps import AppConfig

class CryptoConfig(AppConfig):
    name = 'crypto'

    def ready(self):
        #from .scheduler import start_scheduler
        #request_finished.connect(start_scheduler)
        pass