define(['jquery', 'ractive', 'rv!templates/template', 'text!css/widget-styles.css', 'app/helpers'], function ($, Ractive, mainTemplate, css, helpers) {

    'use strict';

    $.noConflict();
    var xhr_suggestions = null;
    var timeout_suggestions = null;
    var search_widget = {
        init: function (z) {

            var $style = $("<style></style>", {type: "text/css"});
            $style.text(css);

            $("head").append($style);

            Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});

            $('.openstack-search-bar').each(function() {

                var el = $(this);
                var baseUrl = el.data('baseurl') ? el.data('baseurl') : 'search.openstack.org';
                var context = el.data('context') ? el.data('context') : 'www-openstack';
                // render our main view
                this.ractive = new Ractive({
                    el: el,
                    baseUrl: baseUrl,
                    context: context,
                    template: mainTemplate,
                    data: {
                        term: '',
                        page: 1,
                        perPage: 10,
                        pagesToShow: [1,2,3,4,5],
                        fromResult: 1,
                        toResult: 10,
                        total: 88,
                        results: [],
                        suggestions: []
                    }
                });

                this.ractive.on({
                    clear: function(ev) {
                        ev.original.preventDefault();
                        $('.ossw-search-suggestions-wrapper', el).hide();
                        this.set('term', '');
                    },
                    search: function(ev) {
                        var that = this;
                        ev.original.preventDefault();

                        if(ev.original.keyCode == 13) {
                            if ( xhr_suggestions ) xhr_suggestions.abort();
                            if ( timeout_suggestions ) clearTimeout(timeout_suggestions);

                            doSearch(that, true);
                            centerPopup(el);

                        } else {
                            $('.ossw-search-suggestions-wrapper', el).show();
                            if ( timeout_suggestions ) clearTimeout(timeout_suggestions);
                            timeout_suggestions = window.setTimeout(doSuggestions, 500, that);
                        }
                    },
                    searchPopup: function(ev) {
                        var that = this;

                        ev.original.preventDefault();

                        if(ev.original.keyCode == 13) {
                            doSearch(that, true);
                            $('.ossw-suggestions-wrapper', el).hide();
                        } else {
                            $('.ossw-suggestions-wrapper', el).show();
                            if ( timeout_suggestions ) clearTimeout(timeout_suggestions);
                            timeout_suggestions = window.setTimeout(doSuggestions, 500, that);
                        }
                    },
                    closePopup: function(ev) {
                        $('.ossw-search-results', el).hide();
                    },
                    changePage: function(ev, newPage) {
                        var total = this.get('total');
                        var perPage = this.get('perPage');
                        var totalPages = Math.ceil(total / perPage);
                        var that = this;

                        ev.original.preventDefault();
                        if (newPage > totalPages || newPage < 1) return false;

                        helpers.changePagination(that, newPage);
                        doSearch(that, false);
                    }
                });
            });



        }
    };

    function doSearch(that, reset) {
        var term = that.get('term');
        var page = that.get('page');
        var perPage = that.get('perPage');
        var url = 'https://'+that.baseUrl+'/api/public/v1/search/'+that.context;

        $.ajax({
            url: url + '/'+term+'?page='+page+'&page_size='+perPage,
            dataType: "json"
        }).done(function(resp) {
            var results = helpers.mapSearchResults(resp.results);

            that.set('total', resp.qty);
            that.set('results', results);

            if(reset) helpers.resetPagination(that);

        }).fail(function(resp) {
            // error response
        });
    }

    function doSuggestions(that) {
        if ( xhr_suggestions ) xhr_suggestions.abort();
        var term = that.get('term');

        xhr_suggestions = $.ajax({
            url: 'https://'+that.baseUrl+'/api/public/v1/suggestions/'+that.context+'/'+term,
            dataType: "json"
        }).done(function(resp) {
            var results = helpers.mapSuggestions(resp.results);
            xhr_suggestions = null;
            that.set('suggestions', results);

        }).fail(function(resp) {
            // error response
        });
    }

    function centerPopup(el) {
        var winW = $(window).width();
        var newPopWidth = winW * 0.8;
        var popMaxWidth = parseInt($('.ossw-container', el).css('max-width').slice(0, -2));

        $('.ossw-search-results', el).show();
        $('.ossw-suggestions-wrapper', el).hide();
        $('.ossw-search-suggestions-wrapper', el).hide();

        if (newPopWidth < popMaxWidth) {
            $('.ossw-container', el).css('left', winW*0.1);
            $('.ossw-container', el).css('width', winW*0.8);
        } else {
            var halfWin = winW / 2;
            var halfPop = popMaxWidth / 2;
            $('.ossw-container', el).css('left', (halfWin - halfPop) );
        }

    }

    return search_widget;

});
