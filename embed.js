require(["jquery", "app/app"], function($, app) {

    "use strict";

    $(function() {
        var baseUrl = $('#openstack-search-bar').data('baseUrl');
        var context = $('#openstack-search-bar').data('context');
        app.init(baseUrl, context);
    });
});
