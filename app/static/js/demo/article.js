// A look at an article. The links in the results cannot open the real one
// (links.js), so a tap on them shows, for a moment, what an article looks
// like: two screenshots on a stage like the walkthrough's.

import { TIMING, ARTICLE } from './content.js';
import * as guide from './guide.js';
import { picture } from './walkthrough.js';

const ID = 'article';

let stage = null;
let timer = null;

// Built at the start, so that the screenshots are loaded before they are needed
function build() {
    stage = document.createElement('div');
    stage.className = 'walkthrough-stage article-stage';
    stage.hidden = true;
    stage.innerHTML = `
        <div class="walkthrough-scene">
            <div class="walkthrough-narration">
                <div class="walkthrough-perch"></div>
                <div class="walkthrough-speech">
                    <p class="walkthrough-text"></p>
                    <p class="walkthrough-then"></p>
                </div>
            </div>
            <div class="walkthrough-pictures"></div>
            <div class="walkthrough-controls">
                <button type="button" class="walkthrough-next"></button>
            </div>
        </div>`;
    stage.querySelector('.walkthrough-text').textContent = ARTICLE.text;
    stage.querySelector('.walkthrough-then').textContent = ARTICLE.then;
    const pictures = stage.querySelector('.walkthrough-pictures');
    pictures.replaceChildren(...ARTICLE.pictures.map(picture));
    pictures.dataset.count = pictures.childElementCount;
    stage.querySelector('.walkthrough-next').textContent = ARTICLE.button;
    stage.querySelector('.walkthrough-next').addEventListener('click', hideArticle);
    document.body.appendChild(stage);
}

export function showArticle() {
    if (document.activeElement) document.activeElement.blur();  // puts the on-screen keyboard away

    // Play the entrance again every time
    const scene = stage.querySelector('.walkthrough-scene');
    scene.classList.remove('walkthrough-scene--enter');
    void scene.offsetWidth;
    scene.classList.add('walkthrough-scene--enter');

    stage.hidden = false;
    stage.scrollTop = 0;
    document.body.classList.add('article-on-stage');
    guide.perch(ID, stage.querySelector('.walkthrough-perch'));

    clearTimeout(timer);
    timer = setTimeout(hideArticle, TIMING.articleFor * 1000);
}

export function hideArticle() {
    if (stage.hidden) return;
    clearTimeout(timer);
    guide.rest(ID);
    stage.hidden = true;
    document.body.classList.remove('article-on-stage');
}

export function initArticle() {
    build();
    document.addEventListener('demo:reset', hideArticle);
}
