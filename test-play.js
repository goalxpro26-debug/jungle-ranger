// Headless playtest for Jungle Ranger. Run from the game folder with the
// http server up: node test-play.js  (uses playwright-core + system Chromium)
const { chromium } = require('playwright-core');
const fs = require('fs');
const crypto = require('crypto');
const POLICY = __dirname + '/test-webgl-policy.txt';
const POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(POLICY)).digest('hex');
const URL = 'file:///home/hatch/workspace/gamemonetize-restoration/jungle-ranger/index.html';
const OUT = __dirname + '/test-evidence';
fs.mkdirSync(OUT, { recursive: true });
const log = [];
function L(m) { log.push(m); console.log(m); }
function assert(cond, msg) { L((cond ? 'PASS' : 'FAIL') + ' — ' + msg); if (!cond) process.exitCode = 1; }
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const t0 = Date.now();
  const browser = await chromium.launch({ executablePath: '/opt/meta-chromium/chrome',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox', '--disable-dev-shm-usage', '--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required', '--hatch-webgl-allowed-domains-file=' + POLICY, '--hatch-webgl-allowed-domains-sha256=' + POLICY_SHA] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text().slice(0, 300)); });
  const jr = (expr) => page.evaluate(expr);
  await page.goto(URL, { waitUntil: 'load' });
  await sleep(2500);

  // 1. Menu + assets
  assert(await jr(`window.__jungleRanger.state`) === 'menu', 'menu is the initial state');
  assert(await jr(`window.__jungleRanger.imagesLoaded`) === 16, 'all 16 PNG assets loaded (got ' + await jr(`window.__jungleRanger.imagesLoaded`) + ')');
  assert((await jr(`window.__jungleRanger.imagesFailed`)).length === 0, 'no image failed to load');
  assert(await jr(`window.__jungleRanger.gm.preRollShown`) === false, 'no ad / no banner before PLAY (preRollShown false)');
  assert(await jr(`typeof window.SDK_OPTIONS === 'object' && window.SDK_OPTIONS.gameId === '[YOUR GM GAME ID HERE]'`), 'GM placeholder gameId present, no invented ID');
  assert(await jr(`document.documentElement.innerHTML.includes('api.gamemonetize.com/sdk.js')`), 'GM SDK loader present');
  await page.screenshot({ path: OUT + '/01-menu.png' });

  // 2. PLAY -> 3s loading -> level select
  await page.mouse.click(480, 235); // PLAY button centre
  await sleep(300);
  assert(await jr(`window.__jungleRanger.state`) === 'loading', 'PLAY starts 3-second loading screen');
  assert(await jr(`window.__jungleRanger.gm.preRollShown`) === true, 'showBanner attempted on PLAY press (guarded: SDK absent, game continues)');
  await sleep(3400).catch(() => {});
  await page.waitForFunction(() => window.__jungleRanger.state === 'select', null, { timeout: 30000 });
  assert(await jr(`window.__jungleRanger.state`) === 'select', 'loading (3s) lands on level select');
  await page.screenshot({ path: OUT + '/02-select.png' });

  // 3. Level 1 — REAL play with keyboard (no hooks for movement)
  await page.mouse.click(182, 180); // level 1 tile
  await sleep(500);
  assert(await jr(`window.__jungleRanger.state`) === 'playing', 'level 1 starts');
  assert(await jr(`window.__jungleRanger.levelNum`) === 1, 'levelNum is 1');
  const x0 = (await jr(`window.__jungleRanger.player`)).x;
  let maxEbullets = 0, maxCoins = 0, maxX = x0, sawEnemyShoot = false;
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 40; i++) { // 20 s of real play
    await sleep(500);
    if (i % 3 === 0) { await page.keyboard.press('Space'); }
    if (i % 2 === 0) { await page.keyboard.press('KeyJ'); }
    const s = await jr(`({p: window.__jungleRanger.player, eb: window.__jungleRanger.ebullets, c: window.__jungleRanger.coins.got, st: window.__jungleRanger.state})`);
    if (s.p) maxX = Math.max(maxX, s.p.x);
    maxEbullets = Math.max(maxEbullets, s.eb); maxCoins = Math.max(maxCoins, s.c);
    if (s.eb > 0) sawEnemyShoot = true;
    if (s.st !== 'playing') break; // died or finished
  }
  await page.keyboard.up('ArrowRight');
  const afterPlay = await jr(`window.__jungleRanger.state`);
  L('real-play L1: player x ' + Math.round(x0) + ' -> ' + Math.round(maxX) + ', enemy bullets seen max=' + maxEbullets + ', coins collected=' + maxCoins + ', end state=' + afterPlay);
  assert(maxX > x0 + 400, 'real keyboard play moved the ranger right across level 1');
  assert(sawEnemyShoot, 'enemies shot projectiles at the player during real play');
  assert(await jr(`window.__jungleRanger.score`) >= 0, 'score tracked');
  await page.screenshot({ path: OUT + '/03-level1-play.png' });
  if (afterPlay === 'gameover') { // retry if the bot died (3 hearts vs snakes)
    L('bot died in L1 — retrying level via Retry button');
    await page.mouse.click(480, 334); await sleep(500);
    assert(await jr(`window.__jungleRanger.state`) === 'playing', 'retry restarts level 1');
  }
  // Complete L1 via flag warp (movement/combat already proven by real play)
  await jr(`window.__jungleRanger.warpToFlag()`);
  await page.waitForFunction(() => window.__jungleRanger.state === 'complete', null, { timeout: 15000 });
  assert(await jr(`window.__jungleRanger.state`) === 'complete', 'level 1 completes at the flag');
  const save1 = await jr(`window.__jungleRanger.save`);
  assert(save1.unlocked >= 2 && (save1.stars['1'] || 0) >= 1, 'save after L1: unlocked=' + save1.unlocked + ', stars L1=' + save1.stars['1']);
  await page.screenshot({ path: OUT + '/04-level1-complete.png' });

  // 4. Save/resume: reload, Play, select shows progress
  await page.reload({ waitUntil: 'load' }); await sleep(2000);
  assert(await jr(`window.__jungleRanger.state`) === 'menu', 'after reload: back at menu');
  const saveR = await jr(`window.__jungleRanger.save`);
  assert(saveR.unlocked >= 2, 'save SURVIVES reload (unlocked=' + saveR.unlocked + ')');
  await page.mouse.click(480, 235);
  await page.waitForFunction(() => window.__jungleRanger.state === 'select', null, { timeout: 30000 });
  assert(await jr(`window.__jungleRanger.state`) === 'select', 'reload -> PLAY -> loading -> select (resume path)');
  assert(await jr(`window.__jungleRanger.save.unlocked`) >= 2, 'level 2 unlocked on select after reload');

  // 5. Enemy variety: distinct enemy sprite per level
  const metas = await jr(`window.__jungleRanger.levels`);
  assert(metas.length === 12, '12 levels defined');
  assert(new Set(metas.map(m => m.enemy)).size === 12, '12 DISTINCT enemy types across levels: ' + metas.map(m => m.n + '=' + m.enemyName).join(', '));
  assert(metas.filter(m => m.boss).map(m => m.n).join(',') === '4,8,12', 'boss levels are 4, 8, 12');
  for (const m of metas) {
    await jr(`window.__jungleRanger.startLevel(${m.n})`); await sleep(400);
    const imgs = await jr(`window.__jungleRanger.enemies.map(e=>e.img)`);
    assert(imgs.includes(m.enemy === 1 ? 'enemy.png' : 'enemy' + m.enemy + '.png'), 'L' + m.n + ' spawns its own enemy sprite (' + m.enemyName + ')');
    if (m.boss) {
      const minions = await jr(`window.__jungleRanger.enemies.filter(e=>!e.boss)`);
      assert(minions.length === m.count && minions.every(e => e.hp <= 4), 'L' + m.n + ' minions are normal enemies (count=' + minions.length + ', hp<=4), only the boss is big');
    }
  }

  // 6. Sweep levels 2..12 to completion (boss: kill boss first, then flag)
  for (let n = 2; n <= 12; n++) {
    await jr(`window.__jungleRanger.startLevel(${n})`); await sleep(400);
    const isBoss = [4, 8, 12].includes(n);
    if (isBoss) {
      const before = await jr(`window.__jungleRanger.enemies.filter(e=>e.boss).length`);
      assert(before === 1, 'L' + n + ' has exactly 1 boss enemy');
      await page.screenshot({ path: OUT + '/boss-' + n + '.png' });
      await jr(`window.__jungleRanger.killBoss()`); await sleep(300);
    }
    await jr(`window.__jungleRanger.warpToFlag()`);
    await page.waitForFunction((want) => window.__jungleRanger.state === want, (n === 12 ? 'victory' : 'complete'), { timeout: 15000 });
    const st = await jr(`window.__jungleRanger.state`);
    assert(st === (n === 12 ? 'victory' : 'complete'), 'L' + n + ' completes (state=' + st + ')');
    const sv = await jr(`window.__jungleRanger.save`);
    L('  L' + n + ' done: unlocked=' + sv.unlocked + ', stars=' + JSON.stringify(sv.stars));
  }
  await page.screenshot({ path: OUT + '/05-victory.png' });
  const finalSave = await jr(`window.__jungleRanger.save`);
  assert(finalSave.unlocked === 12 && Object.keys(finalSave.stars).length === 12, 'all 12 levels starred in save after sweep');

  // 7. Pause / mute / GM pause-resume simulation
  await jr(`window.__jungleRanger.startLevel(1)`); await sleep(400);
  await page.keyboard.press('KeyP'); await sleep(200);
  assert(await jr(`window.__jungleRanger.paused`) === true, 'P pauses the game');
  await page.keyboard.press('KeyP'); await sleep(200);
  assert(await jr(`window.__jungleRanger.paused`) === false, 'P resumes the game');
  await jr(`window.__gamemonetize.simulatePause()`); await sleep(200);
  assert(await jr(`window.__jungleRanger.paused`) === true, 'SDK_GAME_PAUSE pauses the game');
  await jr(`window.__gamemonetize.simulateResume()`); await sleep(200);
  assert(await jr(`window.__jungleRanger.paused`) === false, 'SDK_GAME_START resumes the game');
  await page.click('#muteBtn'); await sleep(200);
  assert(await jr(`localStorage.getItem('jr_muted')`) === '1', 'mute button mutes (persisted)');
  await page.click('#muteBtn');

  // 8. Final reload: full progress persists
  await page.reload({ waitUntil: 'load' }); await sleep(2000);
  const sv2 = await jr(`window.__jungleRanger.save`);
  assert(sv2.unlocked === 12 && sv2.levelsDone === 12, 'full progress persists after final reload (unlocked 12, levelsDone 12)');

  // Console errors: the GameMonetize SDK script (api.gamemonetize.com/sdk.js)
  // cannot load through this VM's egress proxy (ERR_TUNNEL_CONNECTION_FAILED)
  // — an environment/network failure, not a game error. The game is designed
  // to play fully with the SDK absent. Whitelist only that external resource.
  const realErrors = errors.filter(e => !e.includes('api.gamemonetize.com') && !e.includes('ERR_TUNNEL_CONNECTION_FAILED'));
  L('console/page errors: ' + errors.length + ' total, ' + realErrors.length + ' game errors (sdk.js tunnel failures whitelisted: ' + (errors.length - realErrors.length) + ')');
  realErrors.slice(0, 10).forEach(e => L('  ERR: ' + e));
  assert(realErrors.length === 0, 'zero game console errors / page errors across the whole run');
  L('TOTAL test wall time: ' + Math.round((Date.now() - t0) / 1000) + 's');
  fs.writeFileSync(OUT + '/test-log.txt', log.join('\n') + '\n');
  await browser.close();
})().catch(e => { console.error('TEST CRASH: ' + e.message); process.exitCode = 1; });
