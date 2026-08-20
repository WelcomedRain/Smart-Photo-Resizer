# Smart Photo Resizer

Client-side React + Vite PWA for cropping photos to standard aspect ratios.
No backend, no API keys, no network calls — all image work happens in-browser
on canvas. Occasional-use tool; expect long gaps between sessions.

## Deploy

Push to `main` → GitHub Actions builds and publishes `dist/` to GitHub Pages.
Live at https://welcomedrain.github.io/Smart-Photo-Resizer/ (~40s after push).
The repo is public because Pages on a free plan requires it.

## Do not change the base path

Vite `base` is `/Smart-Photo-Resizer/` because the site is served from a
project subpath, not a domain root. Three places hardcode that string and must
stay in sync:

- `vite.config.ts` — `base`
- `public/manifest.json` — `start_url`, `scope`, icon `src`
- `public/sw.js` — the cached shell paths

Vite rewrites absolute URLs in `index.html` automatically, but it does **not**
touch the contents of files in `public/`. Changing the repo name breaks all of
this.

## Local development

```
npm run dev      # port 3000, binds 0.0.0.0 so a phone on the LAN can reach it
npm run preview  # serves the real production build at the /Smart-Photo-Resizer/ subpath
npm run lint     # tsc --noEmit
npm run build
```

The service worker does **not** register under `npm run dev` — its cached paths
are absolute to the production subpath. Use `npm run preview` to test install
or offline behavior.

## This project came from Google AI Studio — do not re-import it

The AI Studio GitHub export is one-way and structurally incomplete. It omits
`src/main.tsx`, `vite.config.ts`, `tsconfig.json`, and the CSS entry, because
Studio supplies those from its own runtime. An export lands code that cannot
build. Studio is no longer in the loop; this repo is the source of truth.

There is a stale ZIP at `G:\Smart Photo Resizer\Smart-Photo-Resizer-main`
predating the PWA work. Ignore it.

## Layout notes

The workspace is a 12-column grid that changes shape by breakpoint:

- `xl` (≥1280px): preset rail 3 / canvas 5 / analysis 4, all in one row
- `lg` (1024–1279px): full-width preset banner over a 7/5 workspace
- below `lg`: single column

The rail is gated to `xl` deliberately — at `lg` the preset cards measured
106px wide, too cramped to use.

## Verifying UI changes

The preview pane does not advance CSS transitions, so an element mid-transition
reports its pre-transition position indefinitely. This canvas animates the image
with `transition-[left,top,width,height]`, which once made a correctly positioned
overlay look 9px misaligned. Before believing a geometry mismatch, set
`style.transition = 'none'` and re-measure.

Screenshots are often unavailable in this environment. Measure the DOM instead
(`getBoundingClientRect`, `scrollHeight` vs `clientHeight`) and say plainly
that the result was measured, not seen. Gene tests visual results himself —
give him a URL, and state which claims were probed versus inferred.
