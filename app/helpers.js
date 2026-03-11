define([], function () {

    'use strict';

    var MAX_DETAIL_LEN = 100;

    function mapSearchResults(results) {
        return results.map(function(r) {
            var detail = r.hasOwnProperty('meta_description') ? r.meta_description : r.content;
            detail = detail.length > MAX_DETAIL_LEN ? detail.substring(0, MAX_DETAIL_LEN) + '...' : detail;
            var title = r.hasOwnProperty('meta_title') ? r.meta_title : r.title;
            return {link: r.url, title: title, detail: detail};
        });
    }

    function mapSuggestions(results) {
        return results.map(function(r) {
            return {link: r.payload, title: r.term};
        });
    }

    function resetPagination(that) {
        var total = that.get('total');
        var perPage = that.get('perPage');
        var totalPages = Math.ceil(total / perPage);
        var lastPage = (totalPages < 5) ? totalPages : 5;
        var newPagesToShow = [];

        for (var i = 1; i <= lastPage; i++) {
            newPagesToShow.push(i);
        }

        that.set('page', 1);
        that.set('pagesToShow', newPagesToShow);

        var newResultLimit = perPage;
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

        var newResultLimit = (newPage * perPage);
        newResultLimit = (newResultLimit > total) ? total : newResultLimit;
        that.set('fromResult', ((newPage - 1) * perPage) + 1);
        that.set('toResult', newResultLimit);

        if (newPage > lastPage - 1 || newPage < firstPage + 1) {
            var pageFrom;
            var pageTo = ((newPage + 2) < 5) ? 5 : (newPage + 2);

            if (pageTo > totalPages) {
                pageTo = totalPages;
            }

            pageFrom = ((pageTo - 4) < 1) ? 1 : (pageTo - 4);

            for (var i = pageFrom; i <= pageTo; i++) {
                newPagesToShow.push(i);
            }

            that.set('pagesToShow', newPagesToShow);
        }
    }

    return {
        MAX_DETAIL_LEN: MAX_DETAIL_LEN,
        mapSearchResults: mapSearchResults,
        mapSuggestions: mapSuggestions,
        resetPagination: resetPagination,
        changePagination: changePagination
    };

});
