// Starting over: the demo runs on an unattended screen, so when a visitor
// walks away it has to put itself back in order for the next one.

import { TIMING, RESET } from './content.js';
import { aboutIsOpen, closeAbout } from './about.js';
import * as guide from './guide.js';
import { whileIdle, onActivity } from './idle.js';
import { clearSearch } from './inplace_search.js';

const ID = 'reset';

let countdown = null;
let used = false;  // somebody has touched the demo since it last started over

// The start screen: no results, nothing open. At most a few typed words.
function onStartScreen() {
    return !aboutIsOpen() && document.getElementById('results-region').childElementCount === 0
        && !document.body.classList.contains('walkthrough-running');
}

function resetDemo() {
    closeAbout();
    if (document.activeElement) document.activeElement.blur();  // puts the on-screen keyboard away
    clearSearch();
    sessionStorage.removeItem('timelineVisible');
    sessionStorage.removeItem('journalVisible');
    window.scrollTo(0, 0);
    guide.rest();  // whatever was being said was meant for the previous visitor
    document.dispatchEvent(new CustomEvent('demo:reset'));
    used = false;
}

function countdownText(seconds) {
    return RESET.text.replace('{seconds}', seconds);
}

function startCountdown() {
    if (!used || countdown) return;
    // Nothing on screen worth asking about. The demo still has to forget the
    // last visitor: the tips they were given, the words or the keyboard they
    // left behind.
    if (onStartScreen()) {
        resetDemo();
        return;
    }
    let seconds = TIMING.resetWarning;
    guide.say(ID, {
        title: RESET.title,
        text: countdownText(seconds),
        actions: [{ label: RESET.button }],  // any touch cancels, this is simply somewhere to touch
    });
    countdown = setInterval(function () {
        seconds -= 1;
        if (seconds > 0) {
            guide.updateText(ID, countdownText(seconds));
        } else {
            stopCountdown();
            resetDemo();
        }
    }, 1000);
}

function stopCountdown() {
    if (!countdown) return;
    clearInterval(countdown);
    countdown = null;
    guide.rest(ID);
}

export function initReset() {
    whileIdle(TIMING.resetAfter, startCountdown);
    onActivity(function () {
        used = true;
        stopCountdown();
    });

    // The title would reload the page: start over without loading anything
    document.querySelectorAll('.title-link').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            resetDemo();
        });
    });
}
