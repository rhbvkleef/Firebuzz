import math
from itertools import groupby

from operator import itemgetter
from typing import List, Any, Tuple

from sklearn.cluster import MeanShift
import numpy as np
from scipy import spatial

from backend.models import Point


def cluster(points: List[Point]):
    pts = np.array([[point.lon, point.lat] for point in points])
    clustering = MeanShift(bandwidth=32).fit(pts)
    return zip(clustering.labels_, points)


def split(elems: List[Tuple[Any, Any]]):
    b = []
    for k, g in groupby(elems, itemgetter(0)):
        t = list(zip(*g))
        b.append(list(t[1]))
    return b


def circle_params(elems: List[Point]):
    try:
        if len(elems) == 1:
            return (elems[0].lat, elems[0].lon), 0

        if len(elems) == 2:
            lat_r = abs(elems[0].lat - elems[1].lat)**2
            lon_r = abs(elems[0].lon - elems[1].lon)**2
            center = (elems[0].lat + elems[1].lat) / 2, (elems[0].lon + elems[1].lon) / 2
            return center,\
                distance(elems[0].lat, elems[1].lat, elems[0].lon, elems[1].lon)/2

        elems = np.array([[elem.lon, elem.lat] for elem in elems])
        candidates = elems[spatial.ConvexHull(elems).vertices]
        dist_mat = spatial.distance_matrix(candidates, candidates)
        i, j = np.unravel_index(dist_mat.argmax(), dist_mat.shape)
        i, j = candidates[i], candidates[j]
        center = (i[0] + j[0]) / 2, (i[1] + j[1]) / 2
        return (center[1], center[0]), distance(i[0], j[0], i[1], j[1])/2
    except:
        return (0, 0), 0


def distance(lat_0, lat_1, lon_0, lon_1):
    earth_radius = 6371000
    lat1 = math.radians(lat_0)
    lon1 = math.radians(lon_0)
    lat2 = math.radians(lat_1)
    lon2 = math.radians(lon_1)

    dlon = lon2 - lon1
    dlat = lat2 - lat1

    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return earth_radius * c
