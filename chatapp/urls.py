from django.urls import path
from . import views

urlpatterns = [
    path('', views.room_chat, name='room_chat')
]