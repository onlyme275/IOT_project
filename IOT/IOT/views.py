from django.http import JsonResponse
from esp.mqtt_service import mqtt_service

def get_water_level(request):
    return JsonResponse({
        "water": mqtt_service.water_level,
        "raw": 0
    })



