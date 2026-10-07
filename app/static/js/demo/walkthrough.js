// The walkthrough: the story of why VibeSearch exists, then a tour of the real
// thing. The first steps play on a full-screen stage; then the stage lifts
// and the guide carries on over the live page. The story itself is in
// content.js.

import { openAbout, closeAbout } from './about.js';
import { TIMING, WALKTHROUGH } from './content.js';
import * as guide from './guide.js';
import { runSearch, clearSearch } from './inplace_search.js';

const ID = 'walkthrough';
const STEPS = WALKTHROUGH.steps;
const PICTURES = new URL('../../img/demo/', import.meta.url);
const TYPING_MS = 70;  // per letter, when the guide types the search

let stage, pill;
let index = -1;     // the step on show; -1 while the walkthrough is not running
let visit = 0;      // goes up at every step change, so a slow step can tell it was left
let busy = false;   // in the middle of typing and searching: Next has to wait
let repeat = null;  // shows the current step again, after something interrupted the guide

function element(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
}

function pause(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function firstVisible(selector) {
    return Array.from(document.querySelectorAll(selector)).find(function (found) {
        return found.offsetParent !== null;
    });
}

// ---------- The pieces on the page ----------

function build() {
    stage = element(`
        <div class="walkthrough-stage" hidden>
            <div class="walkthrough-scene">
                <div class="walkthrough-narration">
                    <div class="walkthrough-perch">
                        <span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span><span>✦</span>
                    </div>
                    <div class="walkthrough-speech">
                        <h2 class="walkthrough-title"></h2>
                        <p class="walkthrough-text"></p>
                        <p class="walkthrough-then"></p>
                    </div>
                </div>
                <div class="walkthrough-pictures"></div>
                <div class="walkthrough-controls">
                    <button type="button" class="walkthrough-back"></button>
                    <button type="button" class="walkthrough-next"></button>
                </div>
            </div>
        </div>`);
    stage.querySelector('.walkthrough-back').textContent = WALKTHROUGH.back;
    stage.querySelector('.walkthrough-next').textContent = WALKTHROUGH.next;
    stage.querySelector('.walkthrough-back').addEventListener('click', back);
    stage.querySelector('.walkthrough-next').addEventListener('click', next);

    pill = element(`
        <div class="walkthrough-pill" hidden>
            <span class="walkthrough-progress"></span>
            <button type="button" class="walkthrough-exit"></button>
        </div>`);
    pill.querySelector('.walkthrough-exit').textContent = '✕ ' + WALKTHROUGH.exit;
    pill.querySelector('.walkthrough-exit').addEventListener('click', exit);

    document.body.append(stage, pill);
}

// ---------- Steps on the stage ----------

// A screenshot, framed as a little browser window (also used by article.js)
export function picture(item) {
    const figure = element(`
        <figure class="walkthrough-picture">
            <div class="walkthrough-picture-bar"><i></i><i></i><i></i><span></span></div>
            <img alt="">
        </figure>`);
    figure.querySelector('span').textContent = item.label;
    figure.querySelector('img').src = new URL(item.file, PICTURES);
    figure.querySelector('img').alt = 'Screenshot of ' + item.label;
    return figure;
}

function showOnStage(step) {
    const scene = stage.querySelector('.walkthrough-scene');
    const title = stage.querySelector('.walkthrough-title');
    const then = stage.querySelector('.walkthrough-then');
    const pictures = stage.querySelector('.walkthrough-pictures');
    const hero = step.show === 'hero';

    scene.classList.toggle('walkthrough-scene--hero', hero);
    title.textContent = step.title || '';
    title.hidden = !step.title;
    stage.querySelector('.walkthrough-text').textContent = step.text || '';
    then.textContent = step.then || '';
    then.hidden = !step.then;
    pictures.replaceChildren(...(step.pictures || []).map(picture));
    pictures.dataset.count = pictures.childElementCount;
    pictures.hidden = !pictures.childElementCount;
    scene.classList.toggle('walkthrough-scene--words', !hero && !pictures.childElementCount);
    stage.querySelector('.walkthrough-back').hidden = index === 0;

    // Play the entrance again for the new step
    scene.classList.remove('walkthrough-scene--enter');
    void scene.offsetWidth;
    scene.classList.add('walkthrough-scene--enter');

    stage.hidden = false;
    stage.scrollTop = 0;
    document.body.classList.add('walkthrough-on-stage');

    const perch = stage.querySelector('.walkthrough-perch');
    repeat = function () { guide.perch(ID, perch, hero); };
    repeat();
}

function leaveStage() {
    stage.hidden = true;
    document.body.classList.remove('walkthrough-on-stage');
}

// ---------- Steps on the live page ----------

// `pose` is a function, so that it finds its anchor afresh every time
function say(text, pose, extra) {
    const message = Object.assign({ text: text, actions: navigation(), wide: true }, extra);
    repeat = function () { guide.say(ID, message, pose()); };
    repeat();
}

function navigation() {
    const actions = [];
    if (index > 0) actions.push(backAction());
    if (index < STEPS.length - 1) actions.push({ label: WALKTHROUGH.next, onClick: next });
    return actions;
}

function backAction() {
    return { label: WALKTHROUGH.back, onClick: back, secondary: true };
}

function underSearchBar() {
    return { anchor: document.querySelector('.search-input'), offsetX: 70, arrow: true, bubble: 'right' };
}

function atFirstResult() {
    return { anchor: firstVisible('.result-card .result-title'), offsetX: -70, arrow: true };
}

// Open a chart if it is not open already, and point at it
function showChart(step, containerId, toggle) {
    const container = document.getElementById(containerId);
    if (container && container.style.display === 'none') toggle();
    say(step.text, function () {
        return { anchor: document.getElementById(containerId), arrow: true, highlight: true };
    });
}

const LIVE = {
    search: async function (step, stillHere) {
        const input = document.querySelector('.search-input');
        const searched = input.value === WALKTHROUGH.query && document.querySelector('.result-card');
        if (!searched) {
            busy = true;
            clearSearch();
            say(step.typing, underSearchBar, { actions: [backAction()] });
            await pause(TIMING.beforeTyping * 1000);
            for (const letter of WALKTHROUGH.query) {
                if (!stillHere()) return;
                input.value += letter;
                await pause(TYPING_MS);
            }
            await pause(TIMING.afterTyping * 1000);
            if (!stillHere()) return;
            await runSearch({
                search_query: WALKTHROUGH.query,
                num_results: document.getElementById('num-results').value,
                search_type: 'semantic',
            }, ID);
            if (!stillHere()) return;
            busy = false;
        }
        say(step.text, atFirstResult);
    },

    similar: function (step) {
        say(step.text, function () {
            return { anchor: firstVisible('.badge-similar'), arrow: true, highlight: true };
        });
    },

    timeline: function (step) {
        showChart(step, 'histogram-container', toggleTimeline);
    },

    journals: function (step) {
        showChart(step, 'journal-container', toggleJournal);
    },

    // About covers the page, so the guide speaks from its corner and leaves
    // the list of journals free to be scrolled through
    about: function (step) {
        openAbout();
        document.getElementById('available-journals').scrollIntoView();
        say(step.text, function () { return {}; });
    },

    examples: function (step) {
        say(step.text, underSearchBar, {
            choices: WALKTHROUGH.examples.map(function (query) {
                return { label: query, onClick: function () { tryExample(query); } };
            }),
            footnote: step.footnote,
            actions: [backAction(), { label: step.done, onClick: finish }],
        });
    },
};

// ---------- Moving through the steps ----------

function show() {
    const step = STEPS[index];
    const thisVisit = ++visit;
    busy = false;
    pill.querySelector('.walkthrough-progress').textContent = WALKTHROUGH.progress
        .replace('{step}', index + 1)
        .replace('{total}', STEPS.length);

    // During its own step About is left with Next and Back, not with Return
    const about = step.show === 'about';
    if (!about) closeAbout();
    document.body.classList.toggle('walkthrough-about', about);

    const live = LIVE[step.show];
    if (!live) {
        showOnStage(step);
        return;
    }
    leaveStage();
    window.scrollTo(0, 0);
    live(step, function () { return visit === thisVisit; });
}

export function startWalkthrough() {
    if (document.activeElement) document.activeElement.blur();  // puts the on-screen keyboard away
    index = 0;
    document.body.classList.add('walkthrough-running');
    pill.hidden = false;
    document.dispatchEvent(new CustomEvent('demo:walkthrough-start'));
    show();
}

function next() {
    if (busy || index < 0 || index >= STEPS.length - 1) return;
    index += 1;
    show();
}

function back() {
    if (index <= 0) return;
    index -= 1;
    show();
}

// Stop where things are, leaving the page as it is
function exit() {
    if (index < 0) return;
    index = -1;
    visit += 1;
    busy = false;
    repeat = null;
    leaveStage();
    pill.hidden = true;
    document.body.classList.remove('walkthrough-running', 'walkthrough-about');
    guide.rest(ID);
    document.dispatchEvent(new CustomEvent('demo:walkthrough-end'));
}

// The ending: a clean search bar, ready for the visitor's own search
function finish() {
    clearSearch();
    sessionStorage.removeItem('timelineVisible');
    sessionStorage.removeItem('journalVisible');
    exit();
    document.querySelector('.search-input').focus();
}

function tryExample(query) {
    exit();
    runSearch({
        search_query: query,
        num_results: document.getElementById('num-results').value,
        search_type: 'semantic',
    }, 'example');
}

function handleKey(event) {
    const typing = event.target instanceof Element && event.target.closest('input, select, textarea');
    if (index < 0 || typing) return;
    if (event.key === 'ArrowRight') next();
    if (event.key === 'ArrowLeft') back();
    if (event.key === 'Escape') exit();
}

export function initWalkthrough() {
    build();

    document.addEventListener('vibesearch:search-start', function (event) {
        // A search of the visitor's own: they have got the idea
        if (index >= 0 && event.detail.source !== ID) exit();
    });
    document.addEventListener('demo:reset', exit);
    document.addEventListener('keydown', handleKey);

    // If something else borrowed the guide (a blocked link, "Still there?"),
    // pick the step up again once it is free
    setInterval(function () {
        if (index >= 0 && repeat && !guide.speaker()) repeat();
    }, 1000);
}
