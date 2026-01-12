from django.http import JsonResponse
import json
import os

DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "latest_data.json")

def get_water_level(request):
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            data = json.load(f)
            return JsonResponse(data)
    return JsonResponse({"water": 0, "raw": 0})



