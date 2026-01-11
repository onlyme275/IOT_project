from django.apps import AppConfig
import os

class EspConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'esp'

    def ready(self):
        # Run only once (avoid Django reloader duplicate threads)
        if os.environ.get("RUN_MAIN") == "true":
            from .mqtt_service import mqtt_service
            mqtt_service.start()
