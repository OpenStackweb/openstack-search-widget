define(['jquery', 'ractive', 'rv!templates/template', 'text!css/widget-styles.css'], function ($, Ractive, mainTemplate, css) {

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
                    let term = this.get('term');
                    let that = this;
                    ev.original.preventDefault();

                    if(ev.original.keyCode == 13) {
                        doSearch(that, term);
                        $('.search-results').show();
                    } else {
                        window.setTimeout(doSuggestions, 500, that, term);
                    }
                },
                searchPopup: function(ev) {
                    let term = this.get('term');
                    let that = this;

                    ev.original.preventDefault();
                    $('.suggestions-wrapper').show();

                    if(ev.original.keyCode == 13) {
                        doSearch(that, term);
                        $('.suggestions-wrapper').hide();
                    } else {
                        window.setTimeout(doSuggestions, 500, that, term);
                    }
                },
                closePopup: function(ev) {
                    $('.search-results').hide();
                },
                changePage: function(ev, newPage) {
                    let {perPage, total} = this.get();
                    let totalPages = Math.ceil(total / perPage);

                    ev.original.preventDefault();
                    if (newPage > totalPages || newPage < 1) return false;

                    changePagination(that);
                }
            });


        }
    };

    function doSearch(that, term) {
        $.ajax({
            url: `https://devbranch.search.openstack.org/api/public/v1/search/www-openstack/${term}`,
            dataType: "json"
        }).then(function(resp) {
            let results = resp.results.map(r => {
                let term_idx = r.content.toLowerCase().indexOf(term.toLowerCase());
                let detail = '...' + r.content.slice(term_idx - 40, term_idx + 40) + '...';

                return {link: r.url, title: r.title, detail: detail};
            });

            that.set('total', resp.qty);
            that.set('results', results);
            resetPagination(that);

        }, function(resp) {
            alert('error');
        });
    }

    function doSuggestions(that, term) {
        $.ajax({
            url: `https://devbranch.search.openstack.org/api/public/v1/suggestions/www-openstack/${term}`,
            dataType: "json"
        }).then(function(resp) {
            let results = resp.results.map(r => {
                return {link: r.payload, title: r.term};
            });

            that.set('suggestions', results);
        }, function(resp) {
            alert('error');
        });
    }

    function resetPagination(that) {
        let {perPage, total} = that.get();
        let totalPages = Math.ceil(total / perPage);
        let lastPage = (totalPages < 5) ? totalPages : 5;
        let newPagesToShow = [];

        for( var i = 1; i <= lastPage; i++) {
            newPagesToShow.push(i);
        }

        that.set('page', 1);
        that.set('pagesToShow', newPagesToShow);
    }

    function changePagination(that, newPage) {
        let {pagesToShow, perPage, total} = that.get();
        let lastPage = pagesToShow[pagesToShow.length - 1];
        let firstPage = pagesToShow[0];
        let totalPages = Math.ceil(total / perPage);
        let newPagesToShow = [];

        this.set('page', newPage);

        // change results
        let newResultLimit = (newPage * perPage);
        newResultLimit = (newResultLimit > total) ? total : newResultLimit;
        that.set('fromResult', ((newPage - 1) * perPage) + 1);
        that.set('toResult', newResultLimit);

        // change pagination
        if (newPage > lastPage - 2 || newPage < firstPage + 2) {
            let pageFrom = newPage - 2;
            let pageTo = newPage + 2;
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

    return app;

});
