/**
 A JQUERY LOCATION PICKER
 version 0.0.2
 Copyright 2013  Alessandro Staniscia ( alessandro@staniscia.net )
 GNU General Public License, version 2
 */
var OLLatLonPicker = function () {
	var a = this;
	a.vars = {
		map: null,
		markers: null,
		latLongProj: new OpenLayers.Projection("EPSG:4326"),
		form: null
	};
	var b = function (a, b) {
	}, c = function (c) {
	}, d = function (b, c) {
	}, e = function (b, c, d) {
		var e = new OpenLayers.LonLat(c, b).transform(a.vars.map.getProjectionObject(), a.vars.latLongProj);
		$(a.vars.form).find(".gllpLongitude").val(e.lon.toFixed(5)), $(a.vars.form).find(".gllpLatitude").val(e.lat.toFixed(5)), $(a.vars.form).find(".gllpZoom").val(d)
	}, f = function (b) {
		$(a.vars.form).find(".gllpLocationName").val(b), j()
	}, g = function (b, c, d) {
		a.vars.markers.clearMarkers();
		var e = new OpenLayers.LonLat(c, b), f = new OpenLayers.Size(21, 25),
			g = new OpenLayers.Pixel(-(f.w / 2), -f.h),
			h = new OpenLayers.Icon("https://image.flaticon.com/icons/png/512/33/33622.png", f, g);
		a.vars.markers.addMarker(new OpenLayers.Marker(e, h.clone())), a.vars.map.panTo(e), a.vars.map.zoomTo(d), i()
	}, h = function (c, f, h) {
		var i = new OpenLayers.LonLat(f, c).transform(a.vars.latLongProj, a.vars.map.getProjectionObject());
		g(i.lat, i.lon, h), e(i.lat, i.lon, h), b(c, f), d(c, f)
	}, i = function () {
		$(a.vars.form).trigger("location_changed", $(a.vars.cssID))
	}, j = function () {
		$(a.vars.form).trigger("location_name_changed", $(a.vars.cssID))
	}, k = function () {
		$(a.vars.form).trigger("elevation_changed", $(a.vars.cssID))
	}, l = function () {
		$(a.vars.form).find(".gllpUpdateButton").bind("click", function () {
			var c = $(a.vars.form).find(".gllpLatitude").val(),
				e = $(a.vars.form).find(".gllpLongitude").val(),
				f = $(a.vars.form).find(".gllpZoom").val(),
				h = new OpenLayers.LonLat(e, c).transform(a.vars.latLongProj, a.vars.map.getProjectionObject());
			g(h.lat, h.lon, f), b(c, e), d(c, e)
		})
	}, m = function () {
		$(a.vars.form).find(".gllpSearchButton").bind("click", function () {
			c($(a.vars.form).find(".gllpSearchField").val(), !1)
		})
	}, n = {
		init: function (c) {
			a.vars.form = c, defLat = $(a.vars.form).find(".gllpLatitude").val() ? $(a.vars.form).find(".gllpLatitude").val() : 41.9, defLng = $(a.vars.form).find(".gllpLongitude").val() ? $(a.vars.form).find(".gllpLongitude").val() : 12.483333, defZoom = $(a.vars.form).find(".gllpZoom").val() ? parseInt($(a.vars.form).find(".gllpZoom").val()) : 10, a.vars.map = new OpenLayers.Map($(a.vars.form).find(".gllpMap").get(0), {theme: null});
			var f = new OpenLayers.Layer.OSM;
			a.vars.map.addLayer(f);
			var i = new OpenLayers.LonLat(defLng, defLat);
			a.vars.map.setCenter(i, defZoom), a.vars.markers = new OpenLayers.Layer.Markers("Position"), a.vars.map.addLayer(a.vars.markers);
			var j = OpenLayers.Class(OpenLayers.Control, {
				defaultHandlerOptions: {
					single: !0,
					"double": !1,
					pixelTolerance: 0,
					stopSingle: !1,
					stopDouble: !1
				}, initialize: function () {
					this.handlerOptions = OpenLayers.Util.extend({}, this.defaultHandlerOptions), OpenLayers.Control.prototype.initialize.apply(this, arguments), this.handler = new OpenLayers.Handler.Click(this, {click: this.trigger}, this.handlerOptions)
				}, trigger: function (c) {
					lonlat = a.vars.map.getLonLatFromPixel(c.xy), g(lonlat.lat, lonlat.lon, a.vars.map.zoom), e(lonlat.lat, lonlat.lon, a.vars.map.zoom);
					var f = new OpenLayers.LonLat(lonlat.lon, lonlat.lat).transform(a.vars.map.getProjectionObject(), a.vars.latLongProj);
					b(f.lat, f.lon), d(f.lat, f.lon)
				}
			}), k = new j;
			a.vars.map.addControl(k), k.activate(), h(defLat, defLng, defZoom), l(i), m()
		}
	};
	return n
};
(function (a) {
	a(document).ready(function () {
		a(".gllpLatlonPicker").each(function () {
			(new OLLatLonPicker).init(a(this))
		})
	})
})(jQuery);