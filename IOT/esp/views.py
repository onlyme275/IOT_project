from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import importlib
from . import iot_mqtt

@csrf_exempt
@require_http_methods(["POST"])
def run_iot(request):
    try:
        data = json.loads(request.body)
        command = data.get('command')
        
        if command not in ["ON", "OFF"]:
             return JsonResponse({"status": "error", "message": "Invalid command. Use 'ON' or 'OFF'"}, status=400)

        importlib.reload(iot_mqtt)
        
        success = iot_mqtt.publish_message(command)
        
        if success:
            return JsonResponse({"status": "success", "message": f"Device turned {command}"}, status=200)
        else:
            return JsonResponse({"status": "error", "message": "Failed to send IoT signal"}, status=500)
            
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=500)





