from django.urls import path
from . import views

urlpatterns = [
    path('run-iot/', views.run_iot, name='run_iot'),
    path('get-water/', views.get_water_data, name='get_water'),
]


