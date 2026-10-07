// Everything the demo says, and how long it waits before saying it.
// This is the file to edit to change the wording: nothing else needs to change.

// In seconds
export const TIMING = {
    nudgeAfter: 5,        // something typed, then nothing for this long -> "Now search!"
    valueFor: 8,          // how long each value, or answer to a tap, stays up
    valuesAfter: 20,      // with results on screen: no interaction for this long -> the values
    resetAfter: 60,       // no interaction for this long -> "Still there?"
    resetWarning: 10,     // countdown before starting over for the next person
    tipFor: 8,            // each tip stays this long, unless "Got it" is pressed first
    blockedLinkFor: 8,    // how long the "we're keeping you here" message stays
    articleFor: 12,       // how long the look at an article stays, unless its button is pressed first
    beforeTyping: 2,      // walkthrough: pause on "Let's search for a topic…" before typing it
    afterTyping: 1.2,     // walkthrough: pause on the typed search before running it
};

// The small ribbon across the top-right corner, to tell this version from the real one
export const RIBBON = 'Demo version';

// The start screen, where the guide waits under the search bar.
// It always has two speech bubbles there: the invitation and, under it, the offer.
export const START = {
    invitation: {
        title: 'Try me!',
        text: "Type in something you want to research about new media and digital culture.",
    },
    // The way into the walkthrough
    offer: {
        title: 'New here?',
        text: 'Let me show you how this works.',
        button: 'Give me a walkthrough!',
    },
    // Takes the invitation's place when something was typed but not searched
    typed: {
        title: 'Now search!',
        text: 'Press Enter, or tap the purple button.',
    },
};

// What the guide answers when it is tapped. Tap again and it recites the values.
export const POKE = {
    title: 'Hello!',
    text: 'Try typing something in the search bar!',
};

// What VibeSearch stands for. The guide recites these one at a time: after a
// long silence when there are results on screen, and when it is tapped.
export const VALUES = {
    intro: 'I stand for…',
    items: [
        {
            title: 'Small AI',
            text: "My model is only 133 MB and runs on a tiny server. Good search doesn't need giant models like ChatGPT.",
        },
        {
            title: 'By scholars, for scholars',
            text: 'The values of scholarly research guide its design, not the profit motives that drive Google search.',
        },
        {
            title: 'Curation',
            text: 'Not a database of all research, but a way for scholarly communities to help each other search better. Some friction is good!',
        },
    ],
};

export const RESET = {
    title: 'Still there?',
    text: "If not, I'll start over for the next person in {seconds}…",  // {seconds} counts down
    button: "I'm still here!",
};

// The tips that follow a visitor's first search, in this order
export const TIPS = {
    // Points at the first result's title
    results: {
        title: 'That was a vibe search!',
        text: 'You just searched through articles in the vector space: I used the meaning of what you wrote, not the exact words.',
    },
    // Points at the search bar, and only after a search of very few words
    // (`shortSearch` words or fewer) that the visitor typed themselves
    longer: {
        title: 'Tell me more!',
        text: 'I work better with a longer search...',
    },
    shortSearch: 2,
    // Points at the first "Find Similar" button
    similar: {
        title: 'Like one of these?',
        text: 'You can click here to find similar articles.',
    },
    // Points at the Timeline and Journals buttons
    charts: {
        title: 'There are more options up here',
        text: 'See when articles on this topic were published, and in which journals.',
    },
    button: 'Got it',
};

// Links are switched off on the demo, so that nobody leaves it
export const BLOCKED_LINK = {
    // Any link that leads away, e.g. on the About page
    other: "That link leads outside the demo, so we're keeping you here for now.",
    button: 'Got it',
};

// A link in a search result (title, DOI, Libkey) cannot open the article
// either. The visitor gets a short look at what one is like instead:
// `pictures` are files in static/img/demo/.
export const ARTICLE = {
    text: 'This would take you to the article, on a page like this one.',
    then: "This is a demo, so I can't open yours, but this is what it looks like!",
    pictures: [
        { file: 'article-page.png', label: "The article on its journal's website" },
        { file: 'article-pdf.png', label: 'The full text' },
    ],
    button: 'Back to the search',
};

// The walkthrough: a story told in steps, moved through with Next and Back.
// Reword, reorder or delete steps freely. What a step does is set by `show`:
//   'stage'     full-screen text, with optional `pictures` (files in
//               static/img/demo/) and a `then` line that arrives a moment later
//   'hero'      the big entrance: a `title` and a `text`
//   'search'    types `query` into the real search bar and runs it
//   'similar'   points at the first Find Similar button
//   'timeline'  opens the Timeline chart and points at it
//   'journals'  opens the Journals chart and points at it
//   'about'     opens the About page at its list of journals
//   'examples'  the ending: offers the `examples` as searches to tap
// The steps after 'search' need its results, so keep them after it.
export const WALKTHROUGH = {
    next: 'Next',
    back: 'Back',
    exit: 'Exit walkthrough',
    progress: 'Step {step} of {total}',

    query: 'queer personal data privacy',
    examples: ['disinformation in Brazil', 'Dutch Twitter', 'looksmaxing influencer cultures'],

    steps: [
        {
            show: 'stage',
            text: "Let's imagine you're a BA student in Media Studies. You want to research the challenges queer people face in safeguarding their personal data. How do you do research on this?",
        },
        {
            show: 'stage',
            text: 'You could go to Google Scholar, for example…',
            pictures: [{ file: 'google-scholar.png', label: 'Google Scholar' }],
            then: "But the results aren't very good… It shows many articles that are not from Media Studies, but from Law, Computer Science, and even Marketing…",
        },
        {
            show: 'stage',
            text: 'You could also search this on the University Library or on a specific journal…',
            pictures: [
                { file: 'uva-catalogue.png', label: 'University Library' },
                { file: 'sage-journal.png', label: 'A journal' },
            ],
            then: "But the results are scattered across disciplines, and they don't really get your vibe…",
        },
        {
            show: 'hero',
            title: 'Here comes VibeSearch!',
            text: "I'm a curated, AI-based search engine for academic articles.",
        },
        {
            show: 'stage',
            text: "I use a small AI model to do ‘vector search’. This means I search based on the ‘meaning’ of your search query, not the actual words you use.",
            then: 'You can describe your topic in your own words, and I’ll help find helpful articles about it.',
        },
        {
            show: 'search',
            typing: "Let's search for your topic, for example by typing…",
            text: 'Oh wow, those results are great and really helpful for your research!',
        },
        {
            show: 'similar',
            text: 'If you find an article you like, you can click on ✨ Find Similar to search for articles close to it.',
        },
        {
            show: 'timeline',
            text: 'The 📊 Timeline tab shows when articles on this topic were published. Tap a bar to see only that year.',
        },
        {
            show: 'journals',
            text: 'The 📝 Journals tab shows which journals published articles on your query. Tap a slice to see only publications in that journal.',
        },
        {
            show: 'about',
            text: "One more thing: I am a curated search engine. This means I search within a selection of journals selected by scholars in your field. This prototype includes only journals that are useful for New Media and Digital Culture students like you! In the future, people will be able to curate and share lists for other fields!",
        },
        {
            show: 'examples',
            text: 'Okay, now that you got how this works, you can try typing in your own search query. As this prototype was created for students of New Media and Digital Culture, think of something like...',
            footnote: 'Have fun with your research!',
            done: "I'll type my own",
        },
    ],
};
