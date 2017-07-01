$(document).ready(function() {
    $(".file-tabs-menu a").click(function(event) {
        event.preventDefault();
        $(this).parent().addClass("active");
        $(this).parent().siblings().removeClass("active");
        var tab = $(this).attr("tab-id");
        $(".file-tab-content").not(tab).css("display", "none");
        $(tab).fadeIn();
    });
});