// The idle clock: notices when nobody has touched the screen for a while.

const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'input', 'wheel', 'scroll'];

const watchers = [];
const activityListeners = [];
let lastActivity = performance.now();

function arm(watcher) {
    clearInterval(watcher.timer);
    watcher.timer = setInterval(watcher.callback, watcher.seconds * 1000);
}

function handleActivity() {
    lastActivity = performance.now();
    watchers.forEach(arm);
    activityListeners.forEach(function (listener) { listener(); });
}

// Call `callback` once nobody has interacted for `seconds`, and again every
// `seconds` for as long as it stays quiet. Repeating matters because the demo
// also changes the page by itself (the walkthrough runs searches), which is
// not an interaction.
export function whileIdle(seconds, callback) {
    const watcher = { seconds, callback, timer: null };
    watchers.push(watcher);
    arm(watcher);
}

// How long it has been since anybody interacted
export function secondsIdle() {
    return (performance.now() - lastActivity) / 1000;
}

export function onActivity(listener) {
    activityListeners.push(listener);
}

ACTIVITY_EVENTS.forEach(function (name) {
    window.addEventListener(name, handleActivity, { capture: true, passive: true });
});
