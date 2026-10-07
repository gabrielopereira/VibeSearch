// Small talk: what the guide says when nothing else is going on.
//
// On the start screen it waits under the search bar, always saying "Try me!"
// and always offering the walkthrough. Once there are results on screen, or
// while About is open, it keeps to its corner, and recites what VibeSearch
// stands for only after a long silence. And whenever it is tapped, it answers.

import { aboutIsOpen } from './about.js';
import { TIMING, START, POKE, VALUES } from './content.js';
import * as guide from './guide.js';
import { secondsIdle, onActivity } from './idle.js';
import { isSearching } from './inplace_search.js';
import { startWalkthrough } from './walkthrough.js';

const ID = 'smalltalk';

const input = document.querySelector('.search-input');
const results = document.getElementById('results-region');

let recited = 0;       // how many values have been recited; the next one follows on
let pokes = 0;         // how many times this visitor has tapped the guide
let changedAt = null;  // in the corner: how long it had been quiet when the words last changed
let holdUntil = 0;     // an answer to a tap stays up until then
let showing = null;    // on the start screen: 'invitation', 'typed' or 'answer'

function onStartScreen() {
    return !aboutIsOpen() && results.childElementCount === 0;
}

function nextValue() {
    const value = VALUES.items[recited % VALUES.items.length];
    recited += 1;
    return { eyebrow: VALUES.intro, title: value.title, text: value.text };
}

// On the start screen, whatever is said comes with the offer of a walkthrough,
// in a speech bubble of its own.
// `pointing`: 'bar' for the arrow at the search bar, 'button' to move over to
// the search button, nothing for no arrow.
function sayAtStart(words, pointing) {
    const message = Object.assign({}, words, {
        offer: {
            title: START.offer.title,
            text: START.offer.text,
            actions: [{ label: START.offer.button, onClick: startWalkthrough }],
        },
    });
    if (pointing === 'button') {
        guide.say(ID, message, { anchor: document.getElementById('search-button'), arrow: true, bubble: 'left' });
    } else {
        guide.say(ID, message, {
            anchor: input,
            offsetX: 70,
            arrow: pointing === 'bar',
            arrowRoom: true,
            bubble: 'right',
        });
    }
}

function showInvitation() {
    sayAtStart(START.invitation, 'bar');
    showing = 'invitation';
}

function atStart(idle, speaking) {
    // Something typed and then left alone: point out how to search. Once
    // that is up it stays, until the visitor types again or searches.
    const typed = input.value.trim() !== '';
    if (typed && (showing === 'typed' || idle >= TIMING.nudgeAfter)) {
        if (showing !== 'typed' || !speaking) sayAtStart(START.typed, 'button');
        showing = 'typed';
        return;
    }
    if (showing !== 'invitation' || !speaking) showInvitation();
}

function inCorner(idle, speaking) {
    if (idle < TIMING.valuesAfter) {
        // Also when it waited by the search bar for results and no tip followed
        guide.rest();
        changedAt = null;
        return;
    }
    if (speaking && changedAt !== null && idle - changedAt < TIMING.valueFor) return;
    changedAt = idle;
    guide.say(ID, nextValue());
}

// Once a second: see whether it is time to say something else
function tick() {
    if (document.body.classList.contains('walkthrough-running')) return;
    if (isSearching()) return;                  // waiting for the results, in silence
    const speaker = guide.speaker();
    if (speaker && speaker !== ID) return;      // something that matters more is being said
    if (performance.now() < holdUntil) return;  // an answer to a tap is still up
    if (onStartScreen()) atStart(secondsIdle(), speaker === ID); else inCorner(secondsIdle(), speaker === ID);
}

// Tapped: say hello first, then recite the values, one per tap
function answer() {
    if (document.body.classList.contains('walkthrough-running')) return;
    const speaker = guide.speaker();
    if (speaker && speaker !== ID) return;

    const greet = !aboutIsOpen() && pokes % (VALUES.items.length + 1) === 0;
    const words = greet ? POKE : nextValue();
    pokes += 1;
    if (onStartScreen()) sayAtStart(words, greet ? 'bar' : null); else guide.say(ID, words);
    showing = 'answer';
    changedAt = null;
    holdUntil = performance.now() + TIMING.valueFor * 1000;
}

// A search is on its way: wait for it on the spot. If the results bring a
// tip, the guide goes straight there; if not, off to its corner (see tick).
function goQuiet() {
    holdUntil = 0;
    changedAt = null;
    showing = null;
    guide.hush(ID);
}

export function initSmalltalk() {
    document.addEventListener('demo:guide-poked', answer);
    setInterval(tick, 1000);

    // In its corner, the recital stops as soon as somebody does something
    onActivity(function () {
        if (!onStartScreen() && performance.now() >= holdUntil) guide.rest(ID);
    });

    // Typing: whatever else was up makes way for "Try me!" again
    input.addEventListener('input', function () {
        holdUntil = 0;
        if (onStartScreen() && guide.speaker() === ID && showing !== 'invitation') showInvitation();
    });
    document.addEventListener('vibesearch:search-start', goQuiet);
    // The tips get the first word on the results (main.js sets them up first)
    document.addEventListener('vibesearch:results', tick);

    // Back from the walkthrough: straight to its place under the search bar
    document.addEventListener('demo:walkthrough-end', function () {
        if (onStartScreen()) showInvitation();
    });

    // A new visitor: start from the top
    document.addEventListener('demo:reset', function () {
        recited = 0;
        pokes = 0;
        holdUntil = 0;
        showInvitation();
    });

    showInvitation();
}
