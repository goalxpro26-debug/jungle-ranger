// Grab a true mid-gameplay screenshot: menu -> PLAY -> L1, run right + shoot.
const { chromium } = require('playwright-core');
const fs = require('fs');
const crypto = require('crypto');
const POLICY = __dirname + '/test-webgl-policy.txt';
const SHA = crypto.createHash('sha256').update(fs.readFileSync(POLICY)).digest('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/meta-chromium/chrome',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox',
      '--disable-dev-shm-usage', '--allow-file-access-from-files',
      '--hatch-webgl-allowed-domains-file=' + POLICY, '--hatch-webgl-allowed-domains-sha256=' + SHA] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  await page.goto('file:///home/hatch/workspace/gamemonetize-restoration/jungle-ranger/index.html', { waitUntil: 'domcontentloaded' });
  await sleep(2000);
  await page.mouse.click(480, 235);
  await page.waitForFunction(() => window.__jungleRanger.state === 'select', null, { timeout: 30000 });
  await page.mouse.click(182, 180);
  await sleep(500);
  await page.keyboard.down('ArrowRight');
  for (let i = 0; i < 8; i++) { await sleep(500); if (i % 2 === 0) await page.keyboard.press('KeyJ'); if (i % 3 === 0) await page.keyboard.press('Space'); }
  await page.keyboard.up('ArrowRight');
  console.log('state=', await page.evaluate(() => window.__jungleRanger.state), 'player=', JSON.stringify(await page.evaluate(() => window.__jungleRanger.player)));
  await page.screenshot({ path: __dirname + '/test-evidence/03-level1-play.png' });
  console.log('shot ok');
  await browser.close();
})().catch(e => { console.log('CRASH: ' + e.message); process.exit(1); });
