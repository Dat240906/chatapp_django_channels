from django.http import JsonResponse
from django.shortcuts import render
from django.views import View
# Create your views here.




def room_chat(request):
    return render(request, 'chatapp/room.html')




