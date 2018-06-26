define(['jquery', 'ractive', 'rv!templates/template', 'text!css/my-widget.css'], function ($, Ractive, mainTemplate, css) {

    'use strict';

    var app = {
        init: function () {

            var $style = $("<style></style>", {type: "text/css"});
            $style.text(css);

            $("head")
                .append($style)
                .append('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" >');

            // render our main view
            this.ractive = new Ractive({
                el: 'openstack-search-bar',
                template: mainTemplate,
                data: {
                    term: ''
                }
            });

            this.ractive.on({
                clear: function(ev) {
                    ev.original.preventDefault();
                    this.set('term', '');
                },
                search: function(ev) {
                    ev.original.preventDefault();
                    if(ev.original.keyCode == 13) {
                        $('.search-results').show();
                    } else {
                        window.setTimeout(doSearch, 500, this.get('term'));
                    }
                },
                closePopup: function(ev) {
                    $('.search-results').hide();
                }
            });


        }
    };

    function doSearch(term) {
        alert(term);
    }

    return app;

});
