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

## V2 · A little life

V2 is a separate, room-first game at `/v2/`. V1 remains available at `/v1/`, with its source and saves unchanged. Use `npm run dev:v2` to develop v2. The root build now builds both versions before assembling the Pages site.

The cat has actual 8-frame sprite cycles for walking, sitting, sleeping, grooming, stretching, pouncing, hopping, eating, drinking, crouching, and hiding. Each coat has an atlas with soft, wary, and flattened-ear expressions. Frames are rasterized locally from original pixel poses, including individual legs, head, spine, tail, and eyes; there are no external images. Navigation uses a connected, tested room graph with designated furniture jumps and depth-sorted foreground occlusion.

### Spend time in the room

- Tap the food or water bowl. The cat approaches and eats or drinks at the bowl.
- Pick up the brush hanging beside the bookshelf. Drag gently across the cat, or tap the cat four times. Put the tool down to offer quiet company.
- Pick up the feather on the rug. Drag it slowly across the open play area, then pause for a pounce. Three pounces complete a play session. Keyboard users can focus the toy and press Space or Enter to move it.
- Tap the window cushion to invite a nap. “Settle in for the night” lets the cat get comfortable before the next morning.
- Watch posture, ears, and tail. A tired cat rests; an overwhelmed cat declines attention and shelters under the sofa. Put tools down and give space to let it recover. A hungry or thirsty cat seeks a stocked bowl independently.
- On mobile, swipe to explore, use the edge hints to find bowls/tools or the sofa, and use the target icon to find your cat. A focused room accepts left/right arrow keys for camera movement. All interactions also have positioned, labeled HTML buttons.
- The secondary little shop has six decorations, two toys, and two treats. Treat purchases go into the jar on the bookshelf; tap that jar to offer one. Owned decorations and toys can be reselected without another charge.

V2 uses `cozy-cat-apartment:v2`. It never reads, changes, or imports v1 progress. Needs change through activities, not offline elapsed time. The companion drawer exposes optional meters, reduced motion, and a downloadable backup. Invalid saves are preserved until the player chooses a new cat, with a backup download available. Blocked/full storage produces a warning while allowing session play.

Sound defaults on after the first pointer or keyboard gesture, respecting browser autoplay rules. The persistent mute button silences the master bus. The original Web Audio soundscape combines a quiet composed score, filtered city/traffic ambience, optional rain, synthesized purrs and meows, footsteps, drinking, and care sounds. No recordings, network services, or licensed sample downloads are required. Audio suspends in hidden tabs. Reduced motion freezes ambient animation while retaining essential, readable cat movement.

Atmosphere includes drifting clouds, birds, window rain, dust, cup steam, leaf movement, evening windows, and gradual warm lamp lighting. Sunshine/rain is player-selectable. Graphics and sound remain local to the static site.

V2 source: `model.ts` (rules, shop, saves), `navigation.ts` (routes), `sprites.ts` (frame atlases), `scene.ts` (behavior and interaction), `apartment.ts` (layered room), `atmosphere.ts` (lighting and ambient animation), `audio.ts` (soundscape), `main.ts` (HTML controls/persistence), and `style.css`.

`npm test` covers v1 and v2 rules/navigation. `npm run test:browser` covers both games, v2 frame changes and furniture hops, care at objects, temperament and recovery, autonomous eating, real audio output/mute persistence, mobile camera controls, shopping/treats/bedtime, save isolation/recovery, and repository-prefixed Pages paths. Local Chromium is required as described above.

## V3 · Together at home

V3 lives at `/v3/`, with a three-quarter, top-down apartment and a playable owner. Run `npm run dev:v3`. The site build preserves `/v1/` and `/v2/`; their source and browser saves are unchanged.

Start by creating both residents: owner name, four hair presets, five skin tones, four outfits; cat name, six coats, and three personalities. Owner and cat have separately authored, directional pixel-animation atlases. Appearance is saved under `cozy-cat-apartment:v3` along with needs, game time, owner location, purchases, and preferences. V3 never reads or overwrites earlier versions' keys. Invalid saves have a backup option before replacement; unavailable browser storage allows session play with a warning.

### Controls and companionship

- **WASD / arrow keys:** move the owner. **Tap floor:** walk there with furniture-aware routing.
- **Mobile thumbstick:** move; **E / Interact button:** interact nearby. Tap a room object to walk over and use it.
- Tap a bowl: the owner approaches, kneels and refills it, then steps aside for the cat.
- Pick up the brush at the tool crate, then tap the cat to approach and brush. Put it down to offer quiet company.
- Pick up the feather wand. Drag a floor target within the owner's reach, pause for a pounce, and repeat three times. **E** offers a new toy position for keyboard play. The owner visibly holds the wand.
- **C / Call cat:** invite the cat to come over. A calm cat follows, seeks attention, and rubs against your legs. A sulking cat keeps its distance and can ignore a call.
- Tap the sofa or reading chair to sit. A calm cat approaches and hops onto the owner's lap. Move or press **E** to stand, giving the cat time to hop back down.
- **Explore home:** a floor plan with walking destinations for the living room, kitchen, reading nook and bedroom. This routes the owner through actual doorways, without teleporting. The camera follows the owner; the cat can follow between rooms.
- The bedroom bed starts the next day. Cat needs do not deteriorate while the game is closed. Game time advances one minute per active real second, with small activity advances, and gently stops at 10 PM until the player chooses bedtime. Both clock hands, the HUD and lighting use that same saved time.
- The little shop retains decorations, toys and treats. The owner offers purchased treats from the jar on the coffee table. Optional need meters, reduced ambient motion and a save backup are in Household.

### Geometry and visual fixes

Furniture rectangles define the same collision map for keyboard movement, thumbstick movement and both residents' pathfinding. Movement is swept in small steps, so large inputs cannot tunnel through a couch or wall. Cat jumps onto designated surfaces and into laps are explicit elevated transitions from walkable approach points, not floor paths through furniture. Sitting leaves the owner's ground anchor outside the sofa; standing and dismounting return to valid floor positions.

Plants derive their anchors from the supporting tabletop's height and footprint. They are grouped with the supporting fixture for depth sorting, instead of being placed inside the sofa. The bird, skyline and rain render in an exterior layer clipped to four window panes; frame rails render above them. The clock is redrawn from the actual game minutes every frame.

The expanded apartment includes kitchen counters and dining space, a reading chair and bookcase, a bedroom and bedside plants, open passages, and resting/hiding spots. Original local Web Audio music, city ambience, purrs, meows and care sounds remain enabled after the first gesture, with a persistent mute button.

V3 source is self-contained: `care.ts` (state, needs, economy, clock), `world.ts` (layout, collision, paths, window/surface geometry), `sprites.ts` (owner/cat atlases), `room.ts` (layered room and clock), `scene.ts` (owner control, care, cat behavior), `main.ts` (creation, controls, saves and dialogs), `audio.ts`, and `style.css`.
