// // Toggles menu
// $("#menu-toggle").click(function(e) {
//     e.preventDefault();
//     $("#menu-toggle").toggleClass("toggled");
//     $(".page-content-wrapper").toggleClass("toggled");
//     $("#sidebar-wrapper").toggleClass("toggled");
// });
// // Also remove the menu when pressing the wrapper (next to the menu)
// // Small devices only
// $("#content").click(function(e) {
//     if ($(window).width() <= 600) {
//         e.preventDefault();
//         $("#menu-toggle").removeClass("toggled");
//         $(".page-content-wrapper").removeClass("toggled");
//         $("#sidebar-wrapper").removeClass("toggled");
//     }
// });



// Makes sure there is padding to the top
$('.nav-link, .dropdown-item').click(function(){
    var divId = $(this).attr('href');
    $('html, body').animate({
        scrollTop: $(divId).offset().top - 70
    }, 100);
});

// SVG tweaking
$("#check-background").change(function()
{
    if($(this).is(":checked"))
    {
        $("svg").find("g #background").css("fill", "#fff");
    }
    else
    {
        $("svg").find("g #background").css("fill", "none");
    }
});

$("#check-title").change(function()
{
    if($(this).is(":checked"))
    {
        $("svg").find("g #title").css("fill", "#000");
    }
    else
    {
        $("svg").find("g #title").css("fill", "none");
        $("svg").find("g #title").children().css("stroke", "none");
    }
});

$("#check-slogan").change(function()
{
    if($(this).is(":checked"))
    {
        $("svg").find("g #slogan_text").children().css("fill", "#000");
        $("svg").find("g #slogan_background").children().css("fill", "#fff")
    }
    else
    {
        $("svg").find("g #slogan_text").children().css("fill", "none");
        $("svg").find("g #slogan_text").children().css("stroke", "none");
        $("svg").find("g #slogan_background").children().css("fill", "none");
        $("svg").find("g #slogan_background").children().css("stroke", "none");
    }
});

$("#radio-color").change(function()
{
    if($(this).is(":checked"))
    {
        $("svg").find("#Red_Line").children().css("fill", "rgb(203, 51, 59)");
    }
});

$("#radio-black").change(function()
{
    if($(this).is(":checked"))
    {
        $("svg").find("#Red_Line").children().css("fill", "#000");
    }
});

// Download function
setupDownloadLink = function(link) {
    code = $("svg").parent().html();
    link.href = 'data:image/svg+xml;charset=utf-8,' + code + "";
};

