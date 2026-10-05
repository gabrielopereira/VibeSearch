// Entry point of the demo (/demo).
import { initAbout } from './about.js';
import { RIBBON } from './content.js';
import { initGuide } from './guide.js';
import { initInPlaceSearch } from './inplace_search.js';
import { initLinks } from './links.js';
import { initReset } from './reset.js';
import { initSmalltalk } from './smalltalk.js';
import { initTips } from './tips.js';
import { initWalkthrough } from './walkthrough.js';

const ribbon = document.createElement('div');
ribbon.className = 'demo-ribbon';
ribbon.textContent = RIBBON;
document.body.appendChild(ribbon);

initGuide();
initLinks();
initAbout();
initInPlaceSearch();
initTips();
initWalkthrough();
initSmalltalk();
initReset();
