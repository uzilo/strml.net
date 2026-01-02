import 'classlist-polyfill';
import Markdown from 'markdown';
const md = Markdown.markdown.toHTML;
import workText from './work.txt?raw';
import pgpText from './pgp.txt?raw';
import headerHTML from './header.html?raw';
import preStyles from './prestyles.css?raw';
import replaceURLs from './lib/replaceURLs';
import {default as writeChar, writeSimpleChar, handleChar} from './lib/writeChar';
import getPrefix from './lib/getPrefix';
import mouseWheel from 'mouse-wheel';

// Import CSS files as raw strings for Vite
import styles0 from './styles0.css?raw';
import styles1 from './styles1.css?raw';
import styles2 from './styles2.css?raw';
import styles3 from './styles3.css?raw';

let styleText = [styles0, styles1, styles2, styles3];

// Simple delay utility to replace Bluebird's Promise.delay
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Vars that will help us get er done
const isDev = window.location.hostname === 'localhost';
const speed = isDev ? 0 : 16;
let style: HTMLStyleElement;
let styleEl: HTMLPreElement;
let workEl: HTMLPreElement;
let pgpEl: HTMLPreElement;
let skipAnimationEl: HTMLAnchorElement;
let pauseEl: HTMLAnchorElement;
let animationSkipped = false;
let done = false;
let paused = false;
let browserPrefix: string;

// Wait for load to get started.
document.addEventListener("DOMContentLoaded", function() {
  getBrowserPrefix();
  populateHeader();
  getEls();
  createEventHandlers();
  startAnimation();
});

async function startAnimation(): Promise<void> {
  try {
    await writeTo(styleEl, styleText[0], 0, speed, true, 1);
    await writeTo(workEl, workText, 0, speed, false, 1);
    await writeTo(styleEl, styleText[1], 0, speed, true, 1);
    createWorkBox();
    await delay(1000);
    await writeTo(styleEl, styleText[2], 0, speed, true, 1);
    await writeTo(pgpEl, pgpText, 0, speed, false, 32);
    await writeTo(styleEl, styleText[3], 0, speed, true, 1);
  }
  // Flow control straight from the ghettos of Milwaukee
  catch(e) {
    if ((e as Error).message === "SKIP IT") {
      surprisinglyShortAttentionSpan();
    } else {
      throw e;
    }
  }
}

// Skips all the animations.
async function surprisinglyShortAttentionSpan(): Promise<void> {
  if (done) return;
  done = true;
  pgpEl.innerHTML = pgpText;
  let txt = styleText.join('\n');

  // The work-text animations are rough
  style.textContent = "#work-text * { " + browserPrefix + "transition: none; }";
  style.textContent += txt;
  let styleHTML = "";
  for(let i = 0; i < txt.length; i++) {
     styleHTML = handleChar(styleHTML, txt[i]);
  }
  styleEl.innerHTML = styleHTML;
  createWorkBox();

  // There's a bit of a scroll problem with this thing
  let start = Date.now();
  while(Date.now() - 1000 > start) {
    workEl.scrollTop = Infinity;
    styleEl.scrollTop = pgpEl.scrollTop = Infinity;
    await delay(16);
  }
}


/**
 * Helpers
 */

let endOfSentence = /[\.\?\!]\s$/;
let comma = /\D[\,]\s$/;
let endOfBlock = /[^\/]\n\n$/;

async function writeTo(el: HTMLPreElement, message: string, index: number, interval: number, mirrorToStyle: boolean, charsPerInterval: number): Promise<void> {
  if (animationSkipped) {
    // Lol who needs proper flow control
    throw new Error('SKIP IT');
  }
  // Write a character or multiple characters to the buffer.
  let chars = message.slice(index, index + charsPerInterval);
  index += charsPerInterval;

  // Ensure we stay scrolled to the bottom.
  el.scrollTop = el.scrollHeight;

  // If this is going to <style> it's more complex; otherwise, just write.
  if (mirrorToStyle) {
    writeChar(el, chars, style);
  } else {
    writeSimpleChar(el, chars);
  }

  // Schedule another write.
  if (index < message.length) {
    let thisInterval = interval;
    let thisSlice = message.slice(index - 2, index + 1);
    if (comma.test(thisSlice)) thisInterval = interval * 30;
    if (endOfBlock.test(thisSlice)) thisInterval = interval * 50;
    if (endOfSentence.test(thisSlice)) thisInterval = interval * 70;

    do {
      await delay(thisInterval);
    } while(paused);

    return writeTo(el, message, index, interval, mirrorToStyle, charsPerInterval);
  }
}

//
// Older versions of major browsers (like Android) still use prefixes. So we figure out what that prefix is
// and use it.
//
function getBrowserPrefix(): void {
  // Ghetto per-browser prefixing
  browserPrefix = getPrefix(); // could be empty string, which is fine
  styleText = styleText.map(function(text) {
    return text.replace(/-webkit-/g, browserPrefix);
  });
}

//
// Put els into the module scope.
//
function getEls(): void {
  // We're cheating a bit on styles.
  let preStyleEl = document.createElement('style');
  preStyleEl.textContent = preStyles;
  document.head.insertBefore(preStyleEl, document.getElementsByTagName('style')[0]);

  // El refs
  style = document.getElementById('style-tag') as HTMLStyleElement;
  styleEl = document.getElementById('style-text') as HTMLPreElement;
  workEl = document.getElementById('work-text') as HTMLPreElement;
  pgpEl = document.getElementById('pgp-text') as HTMLPreElement;
  skipAnimationEl = document.getElementById('skip-animation') as HTMLAnchorElement;
  pauseEl = document.getElementById('pause-resume') as HTMLAnchorElement;
}

//
// Create links in header (now footer).
//
function populateHeader(): void {
  let header = document.getElementById('header') as HTMLDivElement;
  header.innerHTML = headerHTML;
}

//
// Create basic event handlers for user input.
//
function createEventHandlers(): void {
  // Mirror user edits back to the style element.
  styleEl.addEventListener('input', function() {
    style.textContent = styleEl.textContent;
  });

  // Skip anim on click to skipAnimation
  skipAnimationEl.addEventListener('click', function(e) {
    e.preventDefault();
    animationSkipped = true;
  });

  pauseEl.addEventListener('click', function(e) {
    e.preventDefault();
    if (paused) {
      pauseEl.textContent = "Pause ||";
      paused = false;
    } else {
      pauseEl.textContent = "Resume >>";
      paused = true;
    }
  });
}

//
// Fire a listener when scrolling the 'work' box.
//
function createWorkBox(): void {
  if (workEl.classList.contains('flipped')) return;
  workEl.innerHTML = '<div class="text">' + replaceURLs(workText) + '</div>' +
                     '<div class="md">' + replaceURLs(md(workText)) + '<div>';

  workEl.classList.add('flipped');
  workEl.scrollTop = 9999;

  // flippy floppy
  let flipping = 0;
  mouseWheel(workEl, async function(dx: number, dy: number) {
    if (flipping) return;
    let flipped = workEl.classList.contains('flipped');
    let half = (workEl.scrollHeight - workEl.clientHeight) / 2;
    let pastHalf = flipped ? workEl.scrollTop < half : workEl.scrollTop > half;

    // If we're past half, flip the el.
    if (pastHalf) {
      workEl.classList.toggle('flipped');
      flipping = true;
      await delay(500);
      workEl.scrollTop = flipped ? 0 : 9999;
      flipping = false;
    }

    // Scroll. If we've flipped, flip the scroll direction.
    workEl.scrollTop += (dy * (flipped ? -1 : 1));
  }, true);
}
