// The demo's guide: a crystal ball that floats around the page, points at
// things and talks through a speech bubble. The small talk, the tips and the
// walkthrough all speak through it.
//
//   say(id, message, pose)   fly somewhere and say something
//   updateText(id, text)     change the words, e.g. for a countdown
//   perch(id, element, big)  sit on an element without a bubble, for when
//                            the words are shown some other way
//   rest(id)                 stop talking and go back to the corner
//
// message: { eyebrow, title, text, choices, footnote, actions, wide, offer }
//   eyebrow   a small line above the title
//   choices   [{ label, onClick }], shown as chips under the text
//   footnote  a closing line under the choices
//   actions   [{ label, onClick, secondary }], the buttons at the bottom
//   wide      a wider bubble, for longer texts
//   offer     { title, text, actions }: a second speech bubble, under the
//             ball, for a standing offer that goes with whatever is being said
// pose:    { anchor, offsetX, arrow, arrowRoom, highlight, bubble }
//   anchor     element to sit underneath (or above, when there is no room
//              underneath); without one the guide stays in its corner
//   offsetX    where along the anchor to point, in px from its left, or from
//              its right when negative (default: its middle)
//   arrow      show the big arrow pointing at the anchor
//   arrowRoom  keep the arrow's distance from the anchor even without the
//              arrow, so that the guide does not move when the arrow comes and goes
//   highlight  draw a pulsing outline around the anchor
//   bubble     'left' or 'right': which side of the ball the speech bubble
//              goes (default: whichever side has more room)
//
// `id` names who is talking ('smalltalk', 'tips', 'reset', ...), so that one part of
// the demo cannot silence another by accident.

const MARGIN = 16;        // keep this far from the edges of the screen
const ARROW_HEIGHT = 70;  // room the arrow takes between the anchor and the ball
const BUBBLE_GAP = 14;    // between the ball and its bubble
const BUBBLE_DROP = 6;    // how far below the ball's top its bubble starts; matches demo.css
const NARROWEST_BUBBLE = 240;  // the bubble is squeezed no further than this
const FLIGHT_MS = 700;    // how long a flight takes; matches .guide--flying in demo.css

const BALL_SVG = `
<svg viewBox="0 0 120 132" aria-hidden="true">
    <defs>
        <radialGradient id="guide-glass" cx="36%" cy="30%" r="78%">
            <stop offset="0" stop-color="#f6e1fa"/>
            <stop offset="0.35" stop-color="#c88ad8"/>
            <stop offset="0.75" stop-color="#8e44ab"/>
            <stop offset="1" stop-color="#4f2070"/>
        </radialGradient>
        <clipPath id="guide-inside"><circle cx="60" cy="56" r="46"/></clipPath>
        <filter id="guide-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>
    <circle class="guide-halo" cx="60" cy="56" r="50" fill="#d9a3ea" filter="url(#guide-soft)"/>
    <path d="M31 99 Q60 111 89 99 L99 121 Q60 133 21 121 Z" fill="#3b1d4a"/>
    <ellipse cx="60" cy="100" rx="30" ry="7" fill="#5f3373"/>
    <circle cx="60" cy="56" r="46" fill="url(#guide-glass)"/>
    <g clip-path="url(#guide-inside)">
        <g class="guide-mist" filter="url(#guide-soft)">
            <ellipse cx="40" cy="72" rx="26" ry="13" fill="#f8d0ff" opacity="0.6"/>
            <ellipse cx="82" cy="42" rx="20" ry="11" fill="#ffdcf4" opacity="0.5"/>
            <ellipse cx="70" cy="86" rx="18" ry="9" fill="#b9a4ff" opacity="0.55"/>
        </g>
    </g>
    <g class="guide-eye">
        <ellipse cx="45" cy="58" rx="8.5" ry="10.5" fill="#fff"/>
        <circle class="guide-pupil" cx="45" cy="58" r="4.4" fill="#2a1038"/>
    </g>
    <g class="guide-eye">
        <ellipse cx="75" cy="58" rx="8.5" ry="10.5" fill="#fff"/>
        <circle class="guide-pupil" cx="75" cy="58" r="4.4" fill="#2a1038"/>
    </g>
    <ellipse cx="41" cy="29" rx="14" ry="7.5" fill="#fff" opacity="0.55" transform="rotate(-32 41 29)"/>
    <path class="guide-sparkle" d="M100 8l2.6 7.4 7.4 2.6-7.4 2.6-2.6 7.4-2.6-7.4-7.4-2.6 7.4-2.6z" fill="#fff3a0"/>
    <path class="guide-sparkle guide-sparkle--late" d="M14 30l1.8 5.2 5.2 1.8-5.2 1.8-1.8 5.2-1.8-5.2-5.2-1.8 5.2-1.8z" fill="#fff3a0"/>
</svg>`;

const ARROW_SVG = `
<svg viewBox="0 0 60 70" aria-hidden="true">
    <path d="M30 4 L56 34 H41 V66 H19 V34 H4 Z" fill="#a7549f" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>
</svg>`;

let root, ball, bubble, eyebrowElement, titleElement, textElement, choicesElement, footnoteElement, actionsElement;
let offer, offerTitleElement, offerTextElement, offerActionsElement;
let current = null;  // { id, pose } while speaking, null while resting
let highlighted = null;  // the element wearing the outline
let landsAt = 0;         // when the flight in progress ends

function build() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'guide';
    root.innerHTML = `
        <div class="guide-arrow">${ARROW_SVG}</div>
        <button type="button" class="guide-ball" aria-label="VibeSearch guide">
            <span class="guide-floater">${BALL_SVG}</span>
        </button>
        <div class="guide-bubble" role="status">
            <div class="guide-bubble-eyebrow"></div>
            <div class="guide-bubble-title"></div>
            <div class="guide-bubble-text"></div>
            <div class="guide-bubble-choices"></div>
            <div class="guide-bubble-footnote"></div>
            <div class="guide-bubble-actions"></div>
        </div>
        <div class="guide-offer" hidden>
            <div class="guide-bubble-title"></div>
            <div class="guide-bubble-text"></div>
            <div class="guide-bubble-actions"></div>
        </div>`;
    ball = root.querySelector('.guide-ball');
    bubble = root.querySelector('.guide-bubble');
    eyebrowElement = root.querySelector('.guide-bubble-eyebrow');
    titleElement = root.querySelector('.guide-bubble-title');
    textElement = root.querySelector('.guide-bubble-text');
    choicesElement = root.querySelector('.guide-bubble-choices');
    footnoteElement = root.querySelector('.guide-bubble-footnote');
    actionsElement = root.querySelector('.guide-bubble-actions');
    offer = root.querySelector('.guide-offer');
    offerTitleElement = offer.querySelector('.guide-bubble-title');
    offerTextElement = offer.querySelector('.guide-bubble-text');
    offerActionsElement = offer.querySelector('.guide-bubble-actions');
    document.body.appendChild(root);

    ball.addEventListener('click', function () {
        ball.classList.remove('guide-ball--poked');
        void ball.offsetWidth;  // restart the wiggle if it is still playing
        ball.classList.add('guide-ball--poked');
        document.dispatchEvent(new CustomEvent('demo:guide-poked'));
    });

    // Stay with the anchor when the page moves underneath: scrolling, or
    // the layout shifting because a chart opened or an abstract expanded
    // (without cutting short a flight that is still in progress)
    const follow = function () { place(performance.now() < landsAt); };
    // (capture: About and the walkthrough's stage scroll by themselves)
    window.addEventListener('scroll', follow, { passive: true, capture: true });
    window.addEventListener('resize', follow);
    new ResizeObserver(follow).observe(document.body);

    place(false);
}

function setHighlight(element) {
    if (highlighted) highlighted.classList.remove('guide-target');
    highlighted = element;
    if (highlighted) highlighted.classList.add('guide-target');
}

function flyTo() {
    landsAt = performance.now() + FLIGHT_MS;
    place(true);
}

// The x, on screen, of the spot on the anchor that the pose points at
function pointedX(pose) {
    const rect = pose.anchor.getBoundingClientRect();
    if (pose.offsetX === undefined) return rect.left + rect.width / 2;
    return pose.offsetX < 0 ? rect.right + pose.offsetX : rect.left + pose.offsetX;
}

function place(fly) {
    const pose = current ? current.pose : {};
    const target = pose.anchor || pose.perch;
    if (target && !target.isConnected) {
        rest();  // what it was pointing at has left the page
        return;
    }
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;
    let x, y;
    let above = false;
    let pointed = null;  // the x the arrow has to point at

    root.style.removeProperty('--bubble-room');
    if (pose.perch) {
        const rect = pose.perch.getBoundingClientRect();
        x = rect.left + (rect.width - ball.offsetWidth) / 2;
        y = rect.top + (rect.height - ball.offsetHeight) / 2;
    } else if (pose.anchor) {
        const rect = pose.anchor.getBoundingClientRect();
        const reach = pose.arrow || pose.arrowRoom ? ARROW_HEIGHT : BUBBLE_GAP;
        pointed = pointedX(pose);
        // The bubble gets narrower (and taller) rather than pushing the ball
        // away from what it is pointing at
        const room = root.dataset.bubble === 'right'
            ? viewportWidth - MARGIN - BUBBLE_GAP - (pointed + ball.offsetWidth / 2)
            : pointed - ball.offsetWidth / 2 - BUBBLE_GAP - MARGIN;
        root.style.setProperty('--bubble-room', Math.max(room, NARROWEST_BUBBLE) + 'px');
        const height = Math.max(ball.offsetHeight, bubble.offsetHeight);
        // The offer goes under the ball, and under the bubble beside it
        // where that one hangs lower
        if (!offer.hidden) {
            const top = Math.max(ball.offsetHeight, BUBBLE_DROP + bubble.offsetHeight) + BUBBLE_GAP;
            root.style.setProperty('--offer-top', top + 'px');
        }
        // Underneath the anchor, unless it only fits above
        above = offer.hidden && rect.bottom + reach + height + MARGIN > viewportHeight
            && rect.top - reach - height - MARGIN >= 0;
        x = pointed - ball.offsetWidth / 2;
        y = above ? rect.top - reach - ball.offsetHeight : rect.bottom + reach;
        if (pose.arrow) root.style.setProperty('--look-y', above ? 1 : -1);  // eyes on the anchor
    } else {
        x = viewportWidth - ball.offsetWidth - MARGIN;
        y = viewportHeight - ball.offsetHeight - MARGIN;
    }

    // Leave room for the bubble on the side it opens, then stay on screen
    if (current && !pose.perch) {
        const bubbleRoom = bubble.offsetWidth + BUBBLE_GAP;
        if (root.dataset.bubble === 'right') {
            x = Math.min(x, viewportWidth - MARGIN - ball.offsetWidth - bubbleRoom);
        } else {
            x = Math.max(x, MARGIN + bubbleRoom);
        }
    }
    x = Math.max(MARGIN, Math.min(x, viewportWidth - ball.offsetWidth - MARGIN));

    // If the ball had to give way after all, the arrow stays on its target
    const arrowShift = pointed === null ? 0 : pointed - (x + ball.offsetWidth / 2);
    root.style.setProperty('--arrow-shift', Math.round(arrowShift) + 'px');

    root.classList.toggle('guide--above', above);
    root.classList.toggle('guide--flying', fly);
    root.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}

// Without an arrow to look along, the eyes turn to the bubble
function look(pose, bubbleSide) {
    root.style.setProperty('--look-x', pose.arrow ? 0 : (bubbleSide === 'right' ? 1 : -1));
    root.style.setProperty('--look-y', 0);
}

// The side of the ball with more room for the bubble
function roomierSide(pose) {
    if (!pose.anchor) return 'left';  // the corner is on the right of the screen
    return pointedX(pose) < document.documentElement.clientWidth / 2 ? 'right' : 'left';
}

function makeButton(item, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.textContent = item.label;
    if (item.onClick) button.addEventListener('click', item.onClick);
    return button;
}

function makeActions(actions) {
    return (actions || []).map(function (action) {
        return makeButton(action, 'guide-bubble-button' + (action.secondary ? ' guide-bubble-button--secondary' : ''));
    });
}

export function say(id, message, pose = {}) {
    build();
    const moved = !current || current.id !== id || current.pose.anchor !== pose.anchor;
    current = { id, pose };

    eyebrowElement.textContent = message.eyebrow || '';
    titleElement.textContent = message.title || '';
    titleElement.hidden = !message.title;
    textElement.textContent = message.text || '';
    footnoteElement.textContent = message.footnote || '';
    choicesElement.replaceChildren(...(message.choices || []).map(function (choice) {
        return makeButton(choice, 'guide-bubble-choice');
    }));
    actionsElement.replaceChildren(...makeActions(message.actions));
    offer.hidden = !message.offer;
    offerTitleElement.textContent = message.offer ? message.offer.title : '';
    offerTextElement.textContent = message.offer ? message.offer.text : '';
    offerActionsElement.replaceChildren(...makeActions(message.offer && message.offer.actions));
    root.classList.toggle('guide--wide', !!message.wide);
    root.classList.remove('guide--perched', 'guide--big');

    const bubbleSide = pose.bubble || roomierSide(pose);
    root.dataset.bubble = bubbleSide;
    setHighlight(pose.highlight ? pose.anchor : null);
    root.classList.toggle('guide--arrow', !!pose.arrow);
    root.classList.toggle('guide--anchored', !!pose.anchor);
    root.classList.add('guide--speaking');
    look(pose, bubbleSide);
    if (moved) flyTo(); else place(false);
}

// Change the words of what `id` is saying, leaving everything else in place
export function updateText(id, text) {
    if (current && current.id === id) textElement.textContent = text;
}

// Sit on `element`, saying nothing. `big` for a grand entrance.
export function perch(id, element, big) {
    build();
    const moved = !current || current.pose.perch !== element;
    current = { id, pose: { perch: element } };
    offer.hidden = true;
    setHighlight(null);
    root.classList.remove('guide--arrow', 'guide--anchored', 'guide--above');
    root.classList.add('guide--speaking', 'guide--perched');
    root.classList.toggle('guide--big', !!big);
    root.style.setProperty('--look-x', big ? 0 : 1);  // towards the words beside it
    root.style.setProperty('--look-y', 0);
    if (moved) flyTo(); else place(false);
}

// Without an id: stop whoever is talking
export function rest(id) {
    build();
    if (!current || (id && current.id !== id)) return;
    current = null;
    setHighlight(null);
    root.classList.remove('guide--speaking', 'guide--arrow', 'guide--anchored', 'guide--perched', 'guide--big');
    root.style.setProperty('--look-x', 0);
    root.style.setProperty('--look-y', 0);
    flyTo();
}

// The id of whoever is talking, or null
export function speaker() {
    return current ? current.id : null;
}

export function initGuide() {
    build();
}
