/* global google */
var latlng = new google.maps.LatLng(52.239175, 6.856332);
var settings = {
    zoom: 15,
    center: latlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};

var language = document.documentElement.getAttribute("lang");
var map = new google.maps.Map(document.getElementById("map_canvas"), settings);
var contentString = "";
if (language === "en") {
    contentString = "<form action='https://maps.google.com/maps' method='get' target='_blank' class='mapdirform'>" +
        "<b>From: </b></br>Address (street, location):</br><input type='text' class='inputbox' size='20' style='margin:4px;' name='saddr' id='saddr' value='' /><br />" +
        "<b>To: </b></br>Stichting IAPC" +
        "<input type='hidden' name='daddr' value='IAPC, Enschede'/></br>" +
        "<input value='Route' class='button' type='submit' style='margin:4px;' ></form>";
} else {
    contentString = "<form action='https://maps.google.com/maps' method='get' target='_blank' class='mapdirform'>" +
        "<b>Vanaf: </b></br>Adres (straat, plaats):</br><input type='text' class='inputbox' size='20' style='margin:4px;' name='saddr' id='saddr' value='' /><br />" +
        "<b>Naar: </b></br>Stichting IAPC" +
        "<input type='hidden' name='daddr' value='IAPC, Enschede'/></br>" +
        "<input value='Route' class='button' type='submit' style='margin:4px;' ></form>";
}
var infowindow = new google.maps.InfoWindow({
    content: contentString
});
var companyMarker = new google.maps.Marker({
    position: latlng,
    map: map,
    title: "Stichting IAPC"
});
infowindow.open(map, companyMarker);
google.maps.event.addListener(companyMarker, "click", function () {
    infowindow.open(map, companyMarker);
});
