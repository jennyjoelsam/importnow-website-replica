# ImportNow concept site: rebuild

A rebuild of the ImportNow concept website (a China-to-India import company), made for a hiring assignment. It is plain HTML, CSS and vanilla JavaScript, with Three.js 0.160.0 loaded through an import map. There is no framework and no build step: the files in this repo are the files that get served.

Live site: <LIVE_URL>

## Features

- Three pages: the home page (11 sections), a blog listing, and article pages.
- Blog listing with category filter, text search and pagination (6 posts per page).
- Article pages with table of contents, share links, popular and related posts.
- 3D hero globe (Three.js) with city labels.
- Scroll-driven ship voyage: scrolling the "How it works" section sails a 3D ship from Shanghai to Chennai.
- Scroll reveals, count-up numbers, route marquee, magnetic buttons and tilt cards.
- Quote form that opens WhatsApp with the message pre-filled.

## Project structure

```
.
  index.html        Home page: 11 sections, hero globe and journey canvases
  blog.html         Blog listing (filter, search, pagination)
  post.html         Article template, loaded as post.html?p=<slug>
  assets/
    site.css        All styles, including the appended improvements block
    site.js         Header/footer/icon injection, nav, reveals, counters, marquee,
                    magnetic and tilt effects, blog rendering, WhatsApp form
    posts.js        The 9 articles as data (window.POSTS)
    globe.js        Hero globe scene (ES module, Three.js)
    voyage.js       Scroll-driven ship voyage scene (ES module, Three.js)
    favicon.svg     Favicon (the logo "O")
```

## Run locally

```
python3 -m http.server 8000
```

Run it from the repository folder, then open http://localhost:8000. Opening `index.html` directly as a file will not work: the 3D scripts are ES modules and use an import map, and browsers block module imports from `file://` URLs.

## Improvements over the original

Seven additions that the original does not have (numbered as in the code comments; number 4 was dropped, see below). Every one is marked `IMPROVEMENT (not in original)` in the code (or `IMPROVEMENT #n` in the CSS and HTML).

1. No-WebGL fallback: WebGL is detected first; if missing, both canvases are hidden and the journey shows as a plain step list. Measured: journey section 5376px tall becomes 1033px, all 6 steps visible, no errors.
2. Mobile menu: `aria-expanded` and `aria-controls` on the burger, Escape and outside click close it (Escape returns focus to the burger), and page scroll is locked while it is open.
3. Keyboard focus: visible `:focus-visible` ring. Checked with a real Tab key press: 2px solid #e3241b outline, 3px offset.
5. Favicon and link-preview tags: SVG favicon plus Open Graph and Twitter card tags on all 3 pages.
6. Marquee seam: the duplicated copy now has a trailing gap (`padding-right: 44px`). The loop jump measured 21.58px in the original and -0.42px (sub-pixel) here.
7. Unknown article slug: shows an "Article not found" message with links to the blog, popular posts and related posts, instead of silently showing the newest post.
8. Form feedback: after WhatsApp opens, a short note confirms it and offers a "tap here" link to the same URL in case a pop-up blocker stopped it.

Dropped: a `scroll-padding-top` for the 74px fixed header. Every nav-linked section already has 110px of top padding, which clears the header, so adding it would only push headings lower.

## How it was built

- AI-assisted, using Claude Code. The assignment allows and expects AI tools.
- Research agents (four Claude Sonnet, one Claude Haiku) studied the original site's public source and wrote a detailed build spec: design tokens, copy, structure, animations, 3D scene parameters. A lead model (Claude Opus) checked the spec against the source and filled the gaps it found.
- Builder agents (Claude Sonnet) wrote the code from that spec in 8 phases: page shells, home HTML, CSS, JS behaviour, 3D scenes, blog, form and improvements, then deploy.
- After each phase the lead reviewed the result with comparison scripts before the next phase started: HTML compared tag by tag, CSS declaration by declaration, the 3D scripts token by token, and the rest of the JavaScript by comparing the page it generates with the live original.
- The article text in `assets/posts.js` is the company's own content, copied as data rather than written for this project.
- The two 3D scenes (`globe.js`, `voyage.js`) were reproduced closely from the original's code, with plain-English comments added to explain each block.
- Verification also included live side-by-side tests against the original at 1440, 1024, 768 and 390px widths, and behaviour tests in a browser (scroll, menu, form, filters).

## Credits and licence note

The original design, copy and articles belong to ImportNow. This repository is a hiring-assignment replica, not a product, and every page carries `noindex, nofollow` to keep it out of search engines. Earth and water textures load from the three.js examples (MIT licence) via jsDelivr. Fonts (Sora, Inter) load from Google Fonts.
