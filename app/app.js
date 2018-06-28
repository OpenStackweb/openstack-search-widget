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
                    results: [
                        {
                            link: 'http://google.com',
                            title: 'heat output-show my-<em>kube</em>-cluster <em>kube_minions_external</em>',
                            detail: 'First time here? Check out the FAQ! Chinese English ▼ Hi there! Please sign in tags users badges help...'
                        },

                    ]
                }
            });

            this.ractive.on({
                clear: function(ev) {
                    ev.original.preventDefault();
                    this.set('term', '');
                },
                search: function(ev) {
                    let term = this.get('term');
                    ev.original.preventDefault();
                    if(ev.original.keyCode == 13) {
                        $('.search-results').show();
                    } else {
                        window.setTimeout(doSearch, 500, term);
                    }
                },
                searchPopup: function(ev) {
                    let term = this.get('term');
                    ev.original.preventDefault();

                    $('.suggestions-wrapper').show();

                    if(ev.original.keyCode == 13) {
                        $('.suggestions-wrapper').hide();
                    } else {
                        window.setTimeout(doSearch, 500, term);
                    }
                },
                closePopup: function(ev) {
                    $('.search-results').hide();
                },
                changePage: function(ev, newPage) {
                    let {pagesToShow, perPage, total} = this.get();
                    let lastPage = pagesToShow[pagesToShow.length - 1];
                    let firstPage = pagesToShow[0];
                    let totalPages = Math.ceil(total / perPage);
                    let newPagesToShow = [];

                    if (newPage > totalPages || newPage < 1) return false;

                    ev.original.preventDefault();
                    this.set('page', newPage);

                    // change results
                    let newResultLimit = (newPage * perPage);
                    newResultLimit = (newResultLimit > total) ? total : newResultLimit;
                    this.set('fromResult', ((newPage - 1) * perPage) + 1);
                    this.set('toResult', newResultLimit);

                    // change pagination
                    if (newPage > lastPage - 2 || newPage < firstPage + 2) {
                        let pageFrom = newPage - 2;
                        let pageTo = newPage + 2;

                        if (pageTo > totalPages) {
                            pageTo = totalPages;
                            pageFrom = pageTo - 4;
                        } else if (pageFrom < 1) {
                            pageFrom = 1;
                            pageTo = 5;
                        }

                        for( var i = pageFrom; i <= pageTo; i++) {
                            newPagesToShow.push(i);
                        }
                        this.set('pagesToShow', newPagesToShow);
                    }
                }
            });


        }
    };

    function doSearch(term) {
        console.log('search: '+term);
    }

    return app;

});
