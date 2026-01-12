from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["POST"])
def run_iot(request):
    from .mqtt_service import mqtt_service

    data = json.loads(request.body)
    command = data.get("command")

    if command not in ["ON", "OFF"]:
        return JsonResponse({"error": "Invalid command"}, status=400)

    mqtt_service.publish(mqtt_service.TOPIC_CONTROL, command)
    return JsonResponse({"status": "success", "command": command})


@require_http_methods(["GET"])
def get_water_data(request):
    from .mqtt_service import mqtt_service
    return JsonResponse({
        "water": mqtt_service.water_level
    })
