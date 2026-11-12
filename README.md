# Bunyad Builders — construction website

An award-style construction company website inspired by the techniques used on landonorris.com (Awwwards Site of the Year 2025), rebuilt for a construction business.

## What's inside

| Effect | How it's built |
|---|---|
| 3D safety helmet in the hero that follows your mouse and spins away on scroll | Three.js (WebGL), built from code, so there's no 3D model file |
| Cursor "blob" that reveals the finished city under the blueprint | SVG mask + gooey filter + JavaScript trail |
| Blueprint lines that draw themselves on page load | SVG `stroke-dashoffset` CSS animation |
| Tower that builds itself floor by floor as you scroll (5 stages) | GSAP + ScrollTrigger (pin + scrub) |
| Projects Hall of Fame: hover a blueprint to see the finished building | CSS `clip-path` transition |
| Live safety board counter | GSAP |

Languages: HTML, CSS and JavaScript (ES modules). No build step.

## Run it locally

ES modules don't load from `file://`, so open it through a small local server:

```bash
# Option 1 (Python)
python3 -m http.server 8000
# then open http://localhost:8000

# Option 2: the "Live Server" extension in VS Code
```

## Files

```
index.html          page structure and all text
css/style.css       design tokens (colours, fonts), layout, responsive rules
js/main.js          hero, blob reveal, scroll tower, projects, form
js/hero3d.js        the 3D helmet (Three.js)
js/drawings.js      generator for every building / crane / bridge drawing
vendor/             Three.js and GSAP (kept locally, no CDN needed)
fonts/              Big Shoulders, Big Shoulders Stencil, Public Sans (OFL)
```

## Things to replace before going live

- Company name, phone, email and address (`index.html`)
- The project list (`PROJECTS` in `js/main.js`)
- The safety start date (`safety()` in `js/main.js`)
- The quote form only shows a confirmation; connect it to Formspree, EmailJS or your own backend in `form()` in `js/main.js`
- Colours live at the top of `css/style.css` (`--navy`, `--yellow` …)

## Expertise carousel (McCarthy-style)

Centred, looping carousel: side cards sit at 77% scale, the active card grows to full size and its caption opens (1 s ease-out-cubic, the same timing as the McCarthy site). Arrows, swipe, keyboard arrows and clicking a side card all work.

To use real photos instead of the illustrations, put them in an `images/` folder and add a `photo` field to that slide in `SLIDES` (`js/main.js`):

```js
{ label: 'Safety', title: '…', link: '#safety', cta: '…', scene: 'safety', photo: 'images/safety.jpg' },
```
