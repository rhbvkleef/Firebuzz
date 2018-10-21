import json
from django.http import HttpResponse
from django.shortcuts import render
from django.views import View
from django.core import serializers

from backend.models import Point as PointModel
from backend.util import cluster, split, circle_params


class PickLocation(View):
    def post(self, request, *args, **kwargs):
        body = json.loads(request.body)
        m = PointModel(lat=body['lat'], lon=body['lng'])
        m.save()
        return HttpResponse(serializers.serialize('json', [m, ]))

    def get(self, request, *args, **kwargs):
        points = PointModel.objects.all()
        circles = [circle_params(e) for e in list(split(cluster(points)))]
        return HttpResponse(render(request, 'picker.html',
                                   context={
                                       "points": points,
                                       "circles": circles,
                                   }))


def index(request):
    return HttpResponse(render(request, 'index.html', {}))
