/* eslint-env browser,jquery */
function enableMap() {
    $.getScript("https://maps.google.com/maps/api/js", $.getScript.bind(null, "static/js/map.js"));

    $("#map_wrapper").html("<div id=\"map_canvas\" style=\"width:100%; height:400px\"></div>");
}

$(function() {
    $("#map_image").click(enableMap);
});
