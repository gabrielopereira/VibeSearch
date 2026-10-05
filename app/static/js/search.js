// Behaviour of the search page: the spinner on the search button, and the
// Timeline / Journals charts above the results.

// Swap the search button's icon for a spinner while a search is running
function setSearching(searching) {
    const searchButton = document.getElementById('search-button');
    searchButton.querySelector('.fa-search').style.display = searching ? 'none' : '';
    searchButton.querySelector('.fa-spinner').style.display = searching ? 'inline-block' : 'none';
}

function renderHistogramFromPage() {
    const histogramElement = document.getElementById('year-histogram');
    if (histogramElement && histogramElement.dataset.histogram) {
        renderHistogram(JSON.parse(histogramElement.dataset.histogram));
    }
}

function renderJournalHistogramFromPage() {
    const journalElement = document.getElementById('journal-histogram');
    if (journalElement && journalElement.dataset.journal) {
        renderJournalHistogram(JSON.parse(journalElement.dataset.journal));
    }
}

// Set up the charts for the results that are on the page, reopening the one
// that was open during the last search (session memory).
// Runs on page load; call it again whenever the results are replaced.
function initResults() {
    const histogramContainer = document.getElementById('histogram-container');
    const journalContainer = document.getElementById('journal-container');
    const timelineButton = document.getElementById('timeline-toggle');
    const journalButton = document.getElementById('journal-toggle');

    if (sessionStorage.getItem('timelineVisible') === 'true' && histogramContainer && timelineButton) {
        histogramContainer.style.display = 'block';
        timelineButton.classList.add('active');
    }
    if (sessionStorage.getItem('journalVisible') === 'true' && journalContainer && journalButton) {
        journalContainer.style.display = 'block';
        journalButton.classList.add('active');
    }

    renderHistogramFromPage();
    renderJournalHistogramFromPage();
}

// Timeline toggle functionality with session memory
function toggleTimeline() {
    const histogramContainer = document.getElementById('histogram-container');
    const journalContainer = document.getElementById('journal-container');
    const timelineButton = document.getElementById('timeline-toggle');
    const journalButton = document.getElementById('journal-toggle');

    // Reset any active filtering first
    if (typeof showAllYearResults === 'function') showAllYearResults();
    if (typeof showAllResults === 'function') showAllResults();

    if (histogramContainer.style.display === 'none') {
        // Show timeline, hide journal
        histogramContainer.style.display = 'block';
        timelineButton.classList.add('active');
        if (journalContainer) journalContainer.style.display = 'none';
        if (journalButton) journalButton.classList.remove('active');

        sessionStorage.setItem('timelineVisible', 'true');
        sessionStorage.setItem('journalVisible', 'false');

        // Re-render histogram when showing (in case it was hidden during initial load)
        renderHistogramFromPage();
    } else {
        // Hide timeline
        histogramContainer.style.display = 'none';
        timelineButton.classList.remove('active');
        sessionStorage.setItem('timelineVisible', 'false');
    }
}

// Journal toggle functionality with session memory
function toggleJournal() {
    const histogramContainer = document.getElementById('histogram-container');
    const journalContainer = document.getElementById('journal-container');
    const timelineButton = document.getElementById('timeline-toggle');
    const journalButton = document.getElementById('journal-toggle');

    // Reset any active filtering first
    if (typeof showAllYearResults === 'function') showAllYearResults();
    if (typeof showAllResults === 'function') showAllResults();

    if (journalContainer.style.display === 'none') {
        // Show journal, hide timeline
        journalContainer.style.display = 'block';
        journalButton.classList.add('active');
        if (histogramContainer) histogramContainer.style.display = 'none';
        if (timelineButton) timelineButton.classList.remove('active');

        sessionStorage.setItem('journalVisible', 'true');
        sessionStorage.setItem('timelineVisible', 'false');

        // Re-render journal histogram when showing (in case it was hidden during initial load)
        renderJournalHistogramFromPage();
    } else {
        // Hide journal
        journalContainer.style.display = 'none';
        journalButton.classList.remove('active');
        sessionStorage.setItem('journalVisible', 'false');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.search-form').addEventListener('submit', function() {
        setSearching(true);
    });
    initResults();
});
