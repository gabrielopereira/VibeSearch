// Links that lead out of the demo are switched off: on an unattended screen,
// nothing would bring the next visitor back. The guide explains instead.
//
// The server already leaves the address off these links on the demo
// (templates/_link.html), so they go nowhere even without this file.

import { TIMING, BLOCKED_LINK } from './content.js';
import * as guide from './guide.js';

const ID = 'blocked-link';
const DEMO_ROOT = '/demo';  // the demo's pages all live under this path

let timer = null;

function staysInDemo(link) {
    const url = new URL(link.href, location.href);
    return url.origin === location.origin
        && (url.pathname === DEMO_ROOT || url.pathname.startsWith(DEMO_ROOT + '/'));
}

function dismiss() {
    clearTimeout(timer);
    guide.rest(ID);
}

function handleClick(event) {
    const link = event.target.closest('a[href], a[data-outbound]');
    if (!link || (link.hasAttribute('href') && staysInDemo(link))) return;
    event.preventDefault();

    guide.say(ID, {
        text: link.closest('.result-card') ? BLOCKED_LINK.article : BLOCKED_LINK.other,
        actions: [{ label: BLOCKED_LINK.button, onClick: dismiss }],
    }, { anchor: link, arrow: true });

    clearTimeout(timer);
    timer = setTimeout(dismiss, TIMING.blockedLinkFor * 1000);
}

export function initLinks() {
    document.addEventListener('click', handleClick, true);
    document.addEventListener('auxclick', handleClick, true);  // middle click

    // The other ways out: the right-click menu, dragging a link or a picture
    // to the tab bar, and pinching the page to a zoom the next visitor inherits
    ['contextmenu', 'dragstart', 'gesturestart'].forEach(function (name) {
        document.addEventListener(name, function (event) { event.preventDefault(); }, true);
    });

    // On a computer, zooming comes in other ways: a pinch on the trackpad
    // (which arrives as a wheel event with Ctrl held), Ctrl/Cmd with the
    // wheel, and Ctrl/Cmd with + - 0
    window.addEventListener('wheel', function (event) {
        if (event.ctrlKey || event.metaKey) event.preventDefault();
    }, { capture: true, passive: false });
    window.addEventListener('keydown', function (event) {
        if ((event.ctrlKey || event.metaKey) && ['+', '=', '-', '_', '0'].includes(event.key)) event.preventDefault();
    }, true);
    document.addEventListener('vibesearch:search-start', dismiss);
}
