// The tips: after a search, the guide points out what the visitor is looking
// at and what else they can do, one tip after another. Each tip is given once
// per visitor.

import { aboutIsOpen } from './about.js';
import { TIMING, TIPS } from './content.js';
import * as guide from './guide.js';

const ID = 'tips';

function firstVisible(selector) {
    return Array.from(document.querySelectorAll(selector)).find(function (element) {
        return element.offsetParent !== null;
    });
}

// In the order they are given. `anchor` finds what the tip points at; while
// that is not on the page, the tip waits for a later search.
const ALL_TIPS = [
    {
        name: 'results',
        anchor: function () { return firstVisible('.result-card .result-title'); },
        // The right of the card, where it covers the least. No arrow: this
        // one is about the search as a whole, not about the first result.
        pose: { offsetX: -70, arrow: false },
    },
    {
        name: 'longer',
        anchor: function () { return wasShort ? document.querySelector('.search-input') : null; },
        pose: { offsetX: 70, bubble: 'right' },
        notInWalkthrough: true,  // the walkthrough does not bring this up
    },
    {
        name: 'similar',
        anchor: function () { return firstVisible('.badge-similar'); },
        pose: { highlight: true },
    },
    {
        name: 'charts',
        anchor: function () {
            const button = firstVisible('.timeline-toggle');
            return button && button.parentElement;
        },
        pose: { highlight: true },
    },
];

const given = new Set();  // names of the tips this visitor has had, or does not need
let current = null;       // the tip being given, or about to be
let anchor = null;        // what it points at
let secondsShown = 0;
let wasShort = false;     // the search on screen was a word or two that the visitor typed

function nextTip() {
    return ALL_TIPS.find(function (tip) { return !given.has(tip.name) && tip.anchor(); }) || null;
}

function show() {
    anchor = current.anchor();
    if (!anchor) {
        moveOn();
        return;
    }
    guide.say(ID, {
        title: TIPS[current.name].title,
        text: TIPS[current.name].text,
        actions: [{ label: TIPS.button, onClick: moveOn }],
    }, Object.assign({ anchor: anchor, arrow: true }, current.pose));
}

function moveOn() {
    if (current) given.add(current.name);
    current = nextTip();
    secondsShown = 0;
    if (current) show(); else guide.rest(ID);
}

function pause() {
    current = null;
    guide.rest(ID);
}

function inView(element) {
    const rect = element.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
}

// Once a second: show the tip whose turn it is, and time how long it has been read
function tick() {
    if (!current || aboutIsOpen()) return;  // About covers what the tips point at
    const speaker = guide.speaker();
    if (speaker && speaker !== ID) return;  // something else is being said: wait
    if (!speaker) {
        show();
        return;
    }
    if (inView(anchor)) secondsShown += 1;  // scrolled out of sight does not count
    if (secondsShown >= TIMING.tipFor) moveOn();
}

export function initTips() {
    document.addEventListener('vibesearch:search-start', function (event) {
        if (event.detail.source === 'similar') given.add('similar');  // found it by themselves
        // Stays where it is: the results may well bring the next tip
        current = null;
        guide.hush(ID);
    });

    // The next tip comes with the results, and the guide goes straight to it
    document.addEventListener('vibesearch:results', function (event) {
        const words = event.detail.query.trim().split(/\s+/).length;
        wasShort = event.detail.source === 'search' && words <= TIPS.shortSearch;
        if (!event.detail.ok || !event.detail.count) return;
        current = nextTip();
        secondsShown = 0;
        if (current && !aboutIsOpen() && !guide.speaker()) show();
    });

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.timeline-toggle')) return;
        given.add('charts');  // found it by themselves
        if (current && current.name === 'charts') moveOn();
    });

    // The walkthrough shows nearly everything the tips would
    document.addEventListener('demo:walkthrough-start', function () {
        ALL_TIPS.forEach(function (tip) {
            if (!tip.notInWalkthrough) given.add(tip.name);
        });
        pause();
    });

    document.addEventListener('demo:reset', function () {
        given.clear();
        pause();
    });

    setInterval(tick, 1000);
}
