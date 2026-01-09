from django.urls import path
from . import views

urlpatterns = [
    path('run-iot/', views.run_iot, name='run_iot'),
]
