import json
from django.http import HttpResponse
from django.shortcuts import render
from django.views import View
from django.core import serializers

from backend.models import Point as PointModel


class PickLocation(View):
    def post(self, request, *args, **kwargs):
        body = json.loads(request.body)
        print(body)
        m = PointModel(lat=body['lat'], lon=body['lng'])
        m.save()
        return HttpResponse(serializers.serialize('json', [m, ]))

    def get(self, request, *args, **kwargs):
        points = PointModel.objects.all()
        return HttpResponse(render(request, 'picker.html',
                                   context={"points": points}))
