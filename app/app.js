define(['jquery', 'ractive', 'rv!templates/template', 'text!css/widget-styles.css'], function ($, Ractive, mainTemplate, css) {

    'use strict';

    var xhr_suggestions = null;
    var timeout_suggestions = null;
    var search_widget = {
        init: function (z) {

            var $style = $("<style></style>", {type: "text/css"});
            $style.text(css);

            $("head").append($style);

            $('.openstack-search-bar').each(function() {

                var el = $(this);
                var baseUrl = el.data('baseurl') ? el.data('baseurl') : 'devbranch.search.openstack.org';
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

                        changePagination(that, newPage);
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
            var results = resp.results.map(function(r) {
                var term_idx = r.content.toLowerCase().indexOf(term.toLowerCase());
                var detail = '...' + r.content.slice(term_idx - 40, term_idx + 40) + '...';

                return {link: r.url, title: r.title, detail: detail};
            });

            that.set('total', resp.qty);
            that.set('results', results);

            if(reset) resetPagination(that);

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
            var results = resp.results.map(function(r) {
                return {link: r.payload, title: r.term};
            });
            xhr_suggestions = null;
            that.set('suggestions', results);

        }).fail(function(resp) {
            // error response
        });
    }

    function resetPagination(that) {
        var total = that.get('total');
        var perPage = that.get('perPage');
        var totalPages = Math.ceil(total / perPage);
        var lastPage = (totalPages < 5) ? totalPages : 5;
        var newPagesToShow = [];

        for( var i = 1; i <= lastPage; i++) {
            newPagesToShow.push(i);
        }

        that.set('page', 1);
        that.set('pagesToShow', newPagesToShow);

        // change results
        var newResultLimit = (perPage);
        newResultLimit = (newResultLimit > total) ? total : newResultLimit;
        that.set('fromResult', 1);
        that.set('toResult', newResultLimit);
    }

    function changePagination(that, newPage) {
        var total = that.get('total');
        var pagesToShow = that.get('pagesToShow');
        var perPage = that.get('perPage');
        var lastPage = pagesToShow[pagesToShow.length - 1];
        var firstPage = pagesToShow[0];
        var totalPages = Math.ceil(total / perPage);
        var newPagesToShow = [];

        that.set('page', newPage);

        // change results
        var newResultLimit = (newPage * perPage);
        newResultLimit = (newResultLimit > total) ? total : newResultLimit;
        that.set('fromResult', ((newPage - 1) * perPage) + 1);
        that.set('toResult', newResultLimit);

        // change pagination
        if (newPage > lastPage - 1 || newPage < firstPage + 1) {
            var pageFrom;
            var pageTo = ((newPage + 2) < 5) ? 5 : (newPage + 2);
            newPagesToShow = []

            if (pageTo > totalPages) {
                pageTo = totalPages;
            }

            pageFrom = ((pageTo - 4) < 1) ? 1 : (pageTo - 4);

            for( var i = pageFrom; i <= pageTo; i++) {
                newPagesToShow.push(i);
            }

            that.set('pagesToShow', newPagesToShow);
        }
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
