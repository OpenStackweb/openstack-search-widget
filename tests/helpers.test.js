var helpers = require('../app/helpers');

function createMockState(data) {
    var state = Object.assign({}, data);
    return {
        get: function(key) { return state[key]; },
        set: function(key, value) { state[key] = value; },
        getState: function() { return state; }
    };
}

describe('mapSearchResults', function() {

    it('should use meta_title and meta_description when available', function() {
        var input = [{
            url: 'https://example.com',
            title: 'Fallback Title',
            content: 'Fallback content',
            meta_title: 'Meta Title',
            meta_description: 'Meta description'
        }];

        var result = helpers.mapSearchResults(input);

        expect(result).toEqual([{
            link: 'https://example.com',
            title: 'Meta Title',
            detail: 'Meta description'
        }]);
    });

    it('should fall back to title and content when meta fields are absent', function() {
        var input = [{
            url: 'https://example.com',
            title: 'Regular Title',
            content: 'Regular content'
        }];

        var result = helpers.mapSearchResults(input);

        expect(result).toEqual([{
            link: 'https://example.com',
            title: 'Regular Title',
            detail: 'Regular content'
        }]);
    });

    it('should truncate detail to 100 characters', function() {
        var longContent = 'a'.repeat(150);
        var input = [{
            url: 'https://example.com',
            title: 'Title',
            content: longContent
        }];

        var result = helpers.mapSearchResults(input);

        expect(result[0].detail).toBe('a'.repeat(100) + '...');
        expect(result[0].detail.length).toBe(103);
    });

    it('should not truncate detail at exactly 100 characters', function() {
        var exactContent = 'b'.repeat(100);
        var input = [{
            url: 'https://example.com',
            title: 'Title',
            content: exactContent
        }];

        var result = helpers.mapSearchResults(input);

        expect(result[0].detail).toBe(exactContent);
    });

    it('should handle multiple results', function() {
        var input = [
            { url: 'https://a.com', title: 'A', content: 'Content A' },
            { url: 'https://b.com', title: 'B', content: 'Content B' }
        ];

        var result = helpers.mapSearchResults(input);

        expect(result.length).toBe(2);
        expect(result[0].link).toBe('https://a.com');
        expect(result[1].link).toBe('https://b.com');
    });
});

describe('mapSuggestions', function() {

    it('should map payload to link and term to title', function() {
        var input = [
            { payload: 'https://example.com', term: 'openstack' },
            { payload: 'https://other.com', term: 'nova' }
        ];

        var result = helpers.mapSuggestions(input);

        expect(result).toEqual([
            { link: 'https://example.com', title: 'openstack' },
            { link: 'https://other.com', title: 'nova' }
        ]);
    });

    it('should return empty array for empty input', function() {
        expect(helpers.mapSuggestions([])).toEqual([]);
    });
});

describe('resetPagination', function() {

    it('should reset to page 1 with up to 5 pages', function() {
        var mock = createMockState({ total: 88, perPage: 10 });

        helpers.resetPagination(mock);
        var state = mock.getState();

        expect(state.page).toBe(1);
        expect(state.pagesToShow).toEqual([1, 2, 3, 4, 5]);
        expect(state.fromResult).toBe(1);
        expect(state.toResult).toBe(10);
    });

    it('should show fewer pages when total is small', function() {
        var mock = createMockState({ total: 25, perPage: 10 });

        helpers.resetPagination(mock);
        var state = mock.getState();

        expect(state.pagesToShow).toEqual([1, 2, 3]);
        expect(state.toResult).toBe(10);
    });

    it('should cap toResult at total when total < perPage', function() {
        var mock = createMockState({ total: 7, perPage: 10 });

        helpers.resetPagination(mock);
        var state = mock.getState();

        expect(state.pagesToShow).toEqual([1]);
        expect(state.toResult).toBe(7);
    });

    it('should handle exactly one page', function() {
        var mock = createMockState({ total: 10, perPage: 10 });

        helpers.resetPagination(mock);
        var state = mock.getState();

        expect(state.page).toBe(1);
        expect(state.pagesToShow).toEqual([1]);
        expect(state.fromResult).toBe(1);
        expect(state.toResult).toBe(10);
    });
});

describe('changePagination', function() {

    it('should update page and result range', function() {
        var mock = createMockState({
            total: 88, perPage: 10,
            pagesToShow: [1, 2, 3, 4, 5]
        });

        helpers.changePagination(mock, 3);
        var state = mock.getState();

        expect(state.page).toBe(3);
        expect(state.fromResult).toBe(21);
        expect(state.toResult).toBe(30);
    });

    it('should shift page window when navigating past last visible page', function() {
        var mock = createMockState({
            total: 88, perPage: 10,
            pagesToShow: [1, 2, 3, 4, 5]
        });

        helpers.changePagination(mock, 5);
        var state = mock.getState();

        expect(state.page).toBe(5);
        expect(state.pagesToShow).toEqual([3, 4, 5, 6, 7]);
    });

    it('should not exceed total pages in window', function() {
        var mock = createMockState({
            total: 55, perPage: 10,
            pagesToShow: [1, 2, 3, 4, 5]
        });

        helpers.changePagination(mock, 5);
        var state = mock.getState();

        expect(state.pagesToShow).toEqual([2, 3, 4, 5, 6]);
    });

    it('should cap toResult at total on last page', function() {
        var mock = createMockState({
            total: 88, perPage: 10,
            pagesToShow: [5, 6, 7, 8, 9]
        });

        helpers.changePagination(mock, 9);
        var state = mock.getState();

        expect(state.page).toBe(9);
        expect(state.fromResult).toBe(81);
        expect(state.toResult).toBe(88);
    });

    it('should not shift window when navigating within visible range', function() {
        var mock = createMockState({
            total: 88, perPage: 10,
            pagesToShow: [1, 2, 3, 4, 5]
        });

        helpers.changePagination(mock, 3);
        var state = mock.getState();

        expect(state.pagesToShow).toEqual([1, 2, 3, 4, 5]);
    });
});
