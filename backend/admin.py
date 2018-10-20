from django.contrib import admin
from .models import Point


class PointAdmin(admin.ModelAdmin):
    list_display = ('pk', 'lon', 'lat')


admin.site.register(Point, PointAdmin)
