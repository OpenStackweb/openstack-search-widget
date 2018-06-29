define(['jquery', 'ractive', 'rv!templates/template', 'text!css/widget-styles.css'], function ($, Ractive, mainTemplate, css) {

    'use strict';

    var search_widget = {
        init: function (baseUrl, context) {

            baseUrl = baseUrl ? baseUrl : 'devbranch.search.openstack.org';
            context = context ? context : 'www-openstack';

            var $style = $("<style></style>", {type: "text/css"});
            $style.text(css);

            $("head")
                .append($style)
                .append('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" >');

            // render our main view
            this.ractive = new Ractive({
                el: 'openstack-search-bar',
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
                    this.set('term', '');
                },
                search: function(ev) {
                    var term = this.get('term');
                    var that = this;
                    ev.original.preventDefault();

                    if(ev.original.keyCode == 13) {
                        doSearch(that);
                        $('.ossw-search-results').show();
                        $('.ossw-search-suggestions').hide();
                        $('.ossw-suggestions-wrapper').hide();
                    } else {
                        window.setTimeout(doSuggestions, 500, that);
                    }
                },
                searchPopup: function(ev) {
                    var term = this.get('term');
                    var that = this;

                    ev.original.preventDefault();
                    $('.ossw-suggestions-wrapper').show();

                    if(ev.original.keyCode == 13) {
                        doSearch(that);
                        $('.ossw-suggestions-wrapper').hide();
                    } else {
                        window.setTimeout(doSuggestions, 500, that);
                    }
                },
                closePopup: function(ev) {
                    $('.ossw-search-results').hide();
                },
                changePage: function(ev, newPage) {
                    var total = this.get('total');
                    var perPage = this.get('perPage');
                    var totalPages = Math.ceil(total / perPage);

                    ev.original.preventDefault();
                    if (newPage > totalPages || newPage < 1) return false;

                    changePagination(that);
                    doSearch(that);
                }
            });


        }
    };

    function doSearch(that) {
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
            resetPagination(that);

        }).fail(function(resp) {
            // error response
        });
    }

    var xhr = null;

    function doSuggestions(that) {
        if ( xhr ) xhr.abort();
        var term = that.get('term');

        xhr = $.ajax({
            url: 'https://'+that.baseUrl+'/api/public/v1/suggestions/'+that.context+'/'+term,
            dataType: "json"
        }).done(function(resp) {
            var results = resp.results.map(function(r) {
                return {link: r.payload, title: r.term};
            });
            xhr = null;
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
    }

    function changePagination(that, newPage) {
        var total = that.get('total');
        var pagesToShow = that.get('pagesToShow');
        var perPage = that.get('perPage');
        var lastPage = pagesToShow[pagesToShow.length - 1];
        var firstPage = pagesToShow[0];
        var totalPages = Math.ceil(total / perPage);
        var newPagesToShow = [];

        this.set('page', newPage);

        // change results
        var newResultLimit = (newPage * perPage);
        newResultLimit = (newResultLimit > total) ? total : newResultLimit;
        that.set('fromResult', ((newPage - 1) * perPage) + 1);
        that.set('toResult', newResultLimit);

        // change pagination
        if (newPage > lastPage - 2 || newPage < firstPage + 2) {
            var pageFrom = newPage - 2;
            var pageTo = newPage + 2;
            newPagesToShow = []

            if (pageTo > totalPages) {
                pageTo = totalPages;
            }
            if (pageFrom < 1) {
                pageFrom = 1;
            }

            for( var i = pageFrom; i <= pageTo; i++) {
                newPagesToShow.push(i);
            }

            that.set('pagesToShow', newPagesToShow);
        }
    }

    return search_widget;

});
