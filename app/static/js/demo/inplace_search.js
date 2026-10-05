// Runs searches on the demo page without leaving it. The normal page reloads
// on every search, which would wipe the guide in the middle of a sentence.
//
// Announces what happens on `document`, for the rest of the demo to react to:
//   vibesearch:search-start  { query, source }
//   vibesearch:results       { query, searchType, source, count, ok }
// where source is 'search' (the search bar), 'similar' (a Find Similar
// button), or whatever the caller of runSearch() passed.

const FAILED_MESSAGE = '<div class="no-results">That search did not go through. Please try again.</div>';

let latestSearch = 0;

function announce(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
}

// fields: { search_query, num_results, search_type }
export async function runSearch(fields, source) {
    const thisSearch = ++latestSearch;
    const query = fields.search_query;

    setSearching(true);
    announce('vibesearch:search-start', { query, source });

    let html = FAILED_MESSAGE;
    let ok = false;
    try {
        const response = await fetch(location.pathname, {
            method: 'POST',
            headers: { 'X-Requested-With': 'fetch' },
            body: new URLSearchParams(fields),
        });
        if (response.ok) {
            html = await response.text();
            ok = true;
        }
    } catch (error) {
        // Network trouble: fall through and show FAILED_MESSAGE
    }
    if (thisSearch !== latestSearch) return;  // a newer search has taken over

    document.getElementById('results-region').innerHTML = html;

    // A page load would have filled the form in with what was searched
    document.querySelector('.search-input').value = query;
    document.getElementById('num-results').value = fields.num_results;
    document.getElementById('search-type').value = fields.search_type;

    setSearching(false);
    initResults();
    window.scrollTo(0, 0);

    announce('vibesearch:results', {
        query,
        searchType: fields.search_type,
        source,
        count: document.querySelectorAll('#results-region .result-card').length,
        ok,
    });
}

function searchForm() {
    return document.querySelector('.search-form');
}

// True while the search bar and its options are as they were when the page opened
function formIsUntouched() {
    return Array.from(searchForm().elements).every(function (field) {
        if (field.options) {
            return Array.from(field.options).every(function (option) {
                return option.selected === option.defaultSelected;
            });
        }
        // Buttons have no default value, and nothing a visitor can change
        return field.defaultValue === undefined || field.value === field.defaultValue;
    });
}

// Nothing searched, nothing typed: the page as a new visitor should find it
export function searchIsPristine() {
    return formIsUntouched() && document.getElementById('results-region').childElementCount === 0;
}

// Back to the pristine page
export function clearSearch() {
    latestSearch++;  // abandon a search that is still on its way
    searchForm().reset();
    document.getElementById('results-region').replaceChildren();
    setSearching(false);
}

export function initInPlaceSearch() {
    document.addEventListener('submit', function (event) {
        const form = event.target;
        if (form.method !== 'post' || !form.elements.search_query) return;
        event.preventDefault();
        // Puts the on-screen keyboard away: it would cover half of the results
        if (document.activeElement) document.activeElement.blur();
        const source = form.classList.contains('search-form') ? 'search' : 'similar';
        runSearch(Object.fromEntries(new FormData(form)), source);
    });
}
