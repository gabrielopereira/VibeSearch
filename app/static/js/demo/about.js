// The About page, opened over the search page. An unattended screen should
// never have to load another page: if the network were away just then, it
// would be left on the browser's error page with nobody to bring it back.

import * as guide from './guide.js';

const panel = document.getElementById('demo-about');

export function aboutIsOpen() {
    return !panel.hidden;
}

export function openAbout() {
    if (document.activeElement) document.activeElement.blur();  // puts the on-screen keyboard away
    guide.rest();  // whatever was being said was about the page underneath
    panel.hidden = false;
    panel.scrollTop = 0;
    document.body.classList.add('about-open');
}

export function closeAbout() {
    if (panel.hidden) return;
    guide.rest();  // and whatever was being said here was about About
    panel.hidden = true;
    document.body.classList.remove('about-open');
}

export function initAbout() {
    document.querySelector('.about-link').addEventListener('click', function (event) {
        event.preventDefault();
        openAbout();
    });
    panel.querySelector('.return-link').addEventListener('click', closeAbout);
}
