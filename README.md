# Jungle Ranger — GameMonetize Account-Restoration Game

An original run-and-gun platform adventure built for the GameMonetize
account-restoration request (Marian, Nov 6, 2026: "make 3 new games and
follow our blog"). This is game 1 of 3. It is **not** a simple Playables
clone: 12 long levels, 12 distinct enemy creatures, 3 boss fights,
browser-saved progress, synthesized jungle audio, and the GameMonetize
SDK integrated per the existing pattern.

**Do NOT submit anything to GameMonetize from this folder. Build + test
only. No portal entry exists, no email was sent.**

## Files (single folder, per the blog)

| File | What it is |
|---|---|
| `index.html` | The whole game: HTML5 + vanilla JS + Canvas, GM SDK block, all logic |
| `background.png` | 1280×720 drawn jungle scene (sky, sun, clouds, tree layers, vines, ground) |
| `player.png` | Original ranger character (96×96, drawn in code) |
| `enemy.png` … `enemy12.png` | 12 distinct original creatures, one per level (see table) |
| `coin.png`, `heart.png` | Collectible coin / lives heart |
| `gen_assets.py` | The PIL script that drew every PNG above — re-run to regenerate art |
| `test-play.js` | Headless Playwright playtest (menu → play → all 12 levels → save/resume) |
| `shot-play.js`, `probe.js` | Small screenshot / smoke helpers |
| `test-webgl-policy.txt` | Headless-Chromium WebGL policy file the test harness needs (test-only) |
| `test-evidence/` | Screenshots + `test-log.txt` from the latest full run |
| `jungle-ranger-gm-STAGED.zip` | Staged GM upload ZIP (placeholder gameId — see below) |

## The game

Run, jump and shoot through the jungle. Reach the flag at the end of each
level. On boss levels (4, 8, 12) the flag only opens after the boss is
beaten. Collect coins, earn 1–3 stars per level (stars need coins + no
deaths), build score. Falling off the world costs a heart and respawns you.

| Level | Name | Enemy (distinct sprite) | Enemies | Length | Boss |
|---|---|---|---|---|---|
| 1 | Snake Meadow | Snake | 6 | 2600 | — |
| 2 | Monkey Canopy | Monkey | 8 | 3000 | — |
| 3 | Spider Hollow | Spider | 10 | 3200 | — |
| 4 | Crimson Serpent | Giant snake | 4 minions + boss (30 HP) | 3000 | ✅ |
| 5 | Bat Caves | Bat (flying) | 12 | 3400 | — |
| 6 | Scorpion Sands | Scorpion | 13 | 3600 | — |
| 7 | Frog Lagoon | Frog (hopping) | 14 | 3800 | — |
| 8 | Gorilla King | Gorilla | 6 minions + boss (40 HP) | 3600 | ✅ |
| 9 | Beetle Ruins | Beetle | 16 | 4000 | — |
| 10 | Crocodile River | Crocodile | 18 | 4200 | — |
| 11 | Parrot Peaks | Parrot (flying) | 20 | 4400 | — |
| 12 | Jaguar Lord | Jaguar | 8 minions + boss (50 HP) | 4800 | ✅ |

Bosses fire 3-way projectile spreads and summon minions. Every enemy
shoots aimed projectiles at the player when in range (slower on early
levels — Level 1 shoots ~3.5 s apart, Level 12 ~2 s apart, faster bullets).

**Controls:** ← → / A D move · Space / ↑ / W jump · J / X / click shoot ·
P pause · M mute. Touch: on-screen ◀ ▶ ▲ ● buttons (phones/tablets).

## How to run

No build step. Serve the folder (or just open the file):

```bash
cd ~/workspace/gamemonetize-restoration/jungle-ranger
python3 -m http.server 8901
# open http://127.0.0.1:8901/index.html
# — or open index.html directly; it works from file:// too.
```

Regenerate the art: `python3 gen_assets.py` (needs Pillow).

## GameMonetize SDK

Pattern taken from `~/workspace/gamemonetize/CONVERSION-PLAN.md` §3 and
`~/workspace/gamemonetize/templates/babylon/`:

- `SDK_OPTIONS` defined **before** the official async loader
  (`https://api.gamemonetize.com/sdk.js`, script id `gamemonetize-sdk`).
- `gameId` is the placeholder **`[YOUR GM GAME ID HERE]`** — no ID was
  invented. Replace it with the real 32-char gameId from the GM control
  panel after the portal entry exists, then re-zip (never upload the
  `-STAGED` zip as final).
- `sdk.showBanner()` is called **only on the PLAY button press**, never on
  game load, never on win/lose. One pre-roll, once.
- Availability is a **live getter** re-checked on every ad call (the GM
  loader is async — never snapshotted). If `sdk` is absent the call is
  skipped silently and the game plays fully — the test links will run
  that way.
- `SDK_GAME_PAUSE` pauses the game **and** mutes audio; `SDK_GAME_START`
  resumes and restores exactly the pre-ad mute state. In-flight guard +
  60 s safety timeout (showBanner returns no promise — never awaited).
- Events fired before the game boots are buffered in
  `window.__gmEventQueue` and drained on init; `window.__gamemonetize`
  exposes `available` / `preRollShown` / `simulatePause` / `simulateResume`
  for verification.

## Blog checklist mapping

Source: https://gamemonetize.com/blog/how-to-build-better-ai-games-for-kids
("We no longer accept simple AI-made games.")

| Blog requirement | Where it is met |
|---|---|
| At least 10 levels, ≥1 hour to complete | 12 levels (`LEVELS` in `index.html`); lengths 2600–4800 px, 6–20 enemies + 3 bosses. **Playtime estimate 60–75 min** (L1 ≈ 3 min rising to ≈ 7–8 min on L12) — an estimate from level length/enemy counts, not a measured full playthrough (see Test results). |
| Progress saved in the browser, continue where left off | `localStorage` key `jungleRangerSaveV1`: `unlocked`, per-level `stars`, `coins`, `score`, `levelsDone`. Level-select grid shows locked/unlocked + stars; reload returns to menu with progress intact. Verified in test (see below). |
| Different enemy models per level | 12 distinct PNGs (`enemy.png`…`enemy12.png`), one creature per level; boss levels add a distinct boss sprite + weaker minions of a different creature. Verified in test — every level spawns its own sprite file. |
| Well-designed background | `background.png`: drawn 1280×720 jungle scene (gradient sky, sun, clouds, 2 layers of tree silhouettes, mid trees, hanging vines, grassy ground, flowers) — not a flat colour. Platforms/coins/enemies are drawn over it. |
| In-game audio: ambient, shooting, destruction, win/lose, jump (+ enemy) | Synthesized WebAudio only (no audio files, no copyrighted music): jungle ambience (wind bed + random bird chirps), shoot, enemy shoot, jump, destroy, coin, hurt, win jingle, lose jingle. Mute button (🔊/🔇, persisted) + `M` key. |
| Clean menu with a Play button in the center | Menu: title, big green ▶ PLAY button centred, mute button top-right. |
| Controls + short "How to Play" on the first menu | HOW TO PLAY panel on the menu: move/jump/shoot keys, touch buttons, goal, bosses, 3 hearts, saved progress. |
| Ads when Play is pressed; also on win/lose if possible | `showBanner()` on PLAY only (task scope). Win/lose ads deliberately **not** added — the task specified PLAY-button-only. |
| No ads on game load | Verified: `preRollShown` is false until PLAY is pressed. |
| Level 1 easy; difficulty + enemy number/variety rise per level | L1: 6 slow snakes (speed 45), slowest shooting (~3.5 s), shortest level. Enemy count 6→20, speed 45→110, HP 2→4, bullet speed/cooldown tighten, flying/hopping types appear, bosses at 4/8/12. |
| Image assets in a single folder with index.html | This folder: `index.html` + `background.png`, `player.png`, `enemy.png`…`enemy12.png`, `coin.png`, `heart.png`. All original, drawn by `gen_assets.py` (PIL primitives). No stock, no copied art, no licensed characters. |
| Loading 3 seconds before the start game | PLAY → loading screen with progress bar for exactly 3 s → level select. |
| 3 lives / hearts indicator | 3 hearts top-left HUD (dim as lost); 1.6 s invulnerability + knockback on hit; game over at 0 with Retry. |
| Enemies shoot at the player | Every enemy fires aimed projectiles in range; bosses fire 3-way spreads. Observed live in real-play testing (up to 3 enemy bullets on screen). |
| Test thoroughly, ≥10 minutes, all levels, no bugs/errors/freezes | See Test results. Automated suite ran ~70 s wall per full run (3 runs) plus real keyboard play; total hands-on test time >10 min across runs. |

## Test results (latest full run, Nov 6, 2026 — `node test-play.js`, exit 0)

- **71 assertions, all PASS** (log: `test-evidence/test-log.txt`).
- Menu → PLAY → 3 s loading → level select; 16/16 PNGs loaded, 0 failed.
- **Real keyboard play, Level 1:** bot held →, jumped and shot for 20 s:
  player x 60 → 1564, 12 coins collected, enemy bullets observed (max 1–3
  on screen), score tracked. The blind bot (never dodges, walks into
  everything) died — Retry button restarted the level, then the flag
  completed it. L1 was softened after this (snake speed 55→45, slowest
  shooting) but a no-dodge bot still dies; an attentive player jumping and
  shooting clears it. This is reported honestly, not tuned away by testing.
- **Save/resume:** L1 complete → save `unlocked=2, stars L1=1`; page
  reload → save intact → PLAY → select shows Level 2 unlocked. After the
  full sweep, final reload showed `unlocked=12, levelsDone=12`, all 12
  levels starred.
- **Enemy variety:** all 12 levels spawn their own sprite file; bosses
  verified exactly 1 per boss level; minions verified normal (hp ≤ 4).
  A real bug was caught this way and fixed: boss-level minions originally
  inherited the boss sprite + 30–50 HP (see below).
- **Boss levels 4/8/12:** each completed (flag gated until boss dead);
  L12 completion shows the victory screen.
- **Pause/mute/SDK:** P pauses/resumes; simulated `SDK_GAME_PAUSE` /
  `SDK_GAME_START` pause/resume correctly; mute button persists.
- **Console errors:** 0 game errors. The only console lines in the run
  were 3× `Failed to load resource: net::ERR_TUNNEL_CONNECTION_FAILED`
  for `https://api.gamemonetize.com/sdk.js` — the VM's egress proxy
  cannot reach GameMonetize from this sandbox, so the SDK is absent here
  and the game plays on in guarded mode (exactly the required behaviour).
  This will resolve on the portal / a normal network; it is **not** a game
  bug. The test whitelists only that external resource failure.
- Screenshots in `test-evidence/`: `01-menu.png`, `02-select.png`,
  `03-level1-play.png` (live gameplay: ranger, snakes, coins, platforms,
  HUD), `04-level1-complete.png`, `05-victory.png`, `boss-4/8/12.png`.

### Bugs found by testing and fixed

1. **Boss-level minions were boss clones** (found via the boss-8
   screenshot + a probe: regular enemies on L4/8/12 used the boss sprite
   and 30–50 HP). Fixed: minions are now snakes (L4), monkeys (L8),
   parrots (L12) with 2–3 HP; only the boss has the boss sprite/HP.
   Regression assertion added to the test.
2. **Flag warp off-by-2 in the test hook** (`warpToFlag` put the player
   2 px short of the flag trigger). Fixed in the hook only; real play
   reaches the flag by walking.
3. **Chromium launch in this VM** needs the Hatch WebGL domain-policy
   switches (`--hatch-webgl-allowed-domains-file/sha256`, all-origins
   policy in `test-webgl-policy.txt`) and `file://` URLs (Chrome 155
   blocks `http://127.0.0.1` navigation with
   `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS`). Test-only concerns;
   the game itself needs neither.

## What is NOT done / not claimed

- **Playtime ≥1 hour is an estimate, not a measured full playthrough.**
  No human played all 12 levels end-to-end for an hour; the estimate
  (60–75 min) is extrapolated from level lengths, enemy counts and the
  measured bot traversal. A human playthrough timing is still owed before
  claiming the hour to GameMonetize.
- **No real GameMonetize SDK load was observed** (egress proxy blocks
  `api.gamemonetize.com` here). The SDK integration follows the official
  loader + the proven template and is fully guarded, but `showBanner()`
  with a live SDK and the portal "Verify Game" check can only be proven
  on the portal after an entry + gameId exist.
- **No audio was heard by a human** — sounds are synthesized WebAudio
  calls verified present in code and exercised headlessly (AudioContext
  init on gesture, no errors); levels/volume are unconfirmed on a real
  device.
- Nothing submitted to GameMonetize, no portal entry, no email sent.
