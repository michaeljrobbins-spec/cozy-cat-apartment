# Little windows · Cozy Cat Apartment

A gentle, mobile-friendly pixel-art browser game about caring for a cat in a small city apartment. Create a cat, learn their personality, and spend hearts on a cozy home. Days advance through activities; nothing deteriorates while the game is closed.

## Develop

Use Node.js 24 and npm 11. From the repository root:

```sh
npm ci
npm run dev
```

The development server serves v1. `npm run build` type-checks and builds the complete site into `dist/`; `npm run preview` serves the version landing page and `/v1/` locally.

If the default npm cache is not writable in a managed environment, use `npm ci --cache /tmp/cozy-cat-npm-cache`.

## Validate

```sh
npm test
npm run build
npm run test:browser
```

Browser tests use `/usr/bin/chromium`; set `CHROMIUM_PATH` to a different Chromium executable if needed. Alternatively install Playwright Chromium (`npx playwright install chromium`) and configure its executable path. The browser suite starts the built preview server and tests care, shopping, play, day changes, persistence, storage failures, and mobile layouts. Screenshot artifacts are written to ignored `test-results/`.

## GitHub Pages

In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. The included workflow builds and deploys on pushes to `main`, or through **Run workflow**. It publishes the landing page at the repository's Pages root and v1 at `v1/`. Relative asset URLs support both repository and custom-domain Pages sites. No backend, API keys, or runtime secrets are required.

This checkout's local build does not itself publish the site. Push the changes to run the deployment workflow.

## Version policy

Each major version lives in its own folder with its own package manifest, source, assets, and build configuration. To add v2, create `v2/`, register it in root `workspaces`, add it to the root build command, and add a link to the root landing page. The site assembler includes all built `v<number>/dist` folders. Keep earlier versions and their builds available; do not redirect or overwrite v1.

V1 saves under `cozy-cat-apartment:v1` in `localStorage`. Each major version must use a different key. Saves contain a schema number and are validated on load. Invalid saves are not overwritten until the player explicitly starts fresh; an original backup can be downloaded. Settings also offers a save download for safekeeping (v1 does not include a restore/import interface). Saves stay on the same browser/device and disappear if site data is cleared. Private browsing or blocked/full storage may prevent persistence; the game reports this and remains playable for the session.

## V1 details

- Six coats; shy, playful, and demanding personalities.
- Food, water, comfort, energy, and stimulation meters with expressive written cues.
- Six free care actions; five-pounce touch/drag/keyboard play sessions.
- Activity-driven morning, afternoon, and evening; player-controlled next day.
- Hearts for helpful care, capped repeat rewards per action/day. No heart penalties.
- Six fixed-position decorations, two reusable toys, and two consumable treats.
- Optional synthesized care sounds; reduced-motion setting, native modal focus management, labeled meters, and keyboard controls. Essential gameplay is exposed through HTML controls alongside the canvas.
- Original procedural pixel-art apartment and SVG cat sprites; no external artwork, fonts, trackers, or runtime network requests.

Source: `v1/src/game.ts` (pure rules and save validation), `room.ts` (Phaser scene and sprites), `main.ts` (accessible UI and persistence), `style.css` (responsive presentation).
