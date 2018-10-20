/* eslint-env browser,jquery */
// Wait for the entire page to load
$(function() {
    // When it is loaded, start an HTTP GET request to api/isOpen.
    $.ajax({
        url: "api/isOpen",
        error: function() {
            // If an error occurred, show the status unknown message
            // and the info about the store being closed
            $("#openstatus").html($("#openstatus_unknown").html());
            $("#openinfo").html($("#openinfo_closed").html());
        },
        success: function(data) {
            // If the request is successful, then check if the store
            // is open (data is a boolean containing this information)

            if (data === "true" || (typeof data === "boolean" && data)) {
                // If data is true (store is open), show the open info and
                // status message.
                $("#openstatus").html($("#openstatus_open").html());
                $("#openinfo").html($("#openinfo_open").html());
            } else {
                // If data is false (store is closed) show the closed info and
                // status message.
                $("#openstatus").html($("#openstatus_closed").html());
                $("#openinfo").html($("#openinfo_closed").html());
            }
        }
    });
});
