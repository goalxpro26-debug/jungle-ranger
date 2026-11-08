// Quick smoke probe: load the game, print state + asset counts, exit fast.
const { chromium } = require('playwright-core');
const fs = require('fs');
const crypto = require('crypto');
const POLICY = __dirname + '/test-webgl-policy.txt';
const SHA = crypto.createHash('sha256').update(fs.readFileSync(POLICY)).digest('hex');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/meta-chromium/chrome',
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox',
      '--disable-dev-shm-usage', '--allow-file-access-from-files',
      '--hatch-webgl-allowed-domains-file=' + POLICY, '--hatch-webgl-allowed-domains-sha256=' + SHA] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.on('pageerror', e => console.log('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE: ' + m.text().slice(0, 200)); });
  page.on('requestfailed', r => console.log('REQFAIL: ' + r.url().slice(0, 90) + ' ' + (r.failure() || {}).errorText));
  console.log('goto start', new Date().toISOString());
  await page.goto('file:///home/hatch/workspace/gamemonetize-restoration/jungle-ranger/index.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('domcontentloaded', new Date().toISOString());
  await page.waitForTimeout(3000);
  console.log('state=', await page.evaluate(() => window.__jungleRanger && window.__jungleRanger.state));
  console.log('imagesLoaded=', await page.evaluate(() => window.__jungleRanger && window.__jungleRanger.imagesLoaded));
  console.log('imagesFailed=', await page.evaluate(() => window.__jungleRanger && window.__jungleRanger.imagesFailed));
  console.log('gm=', await page.evaluate(() => window.__jungleRanger && JSON.stringify(window.__jungleRanger.gm)));
  await page.screenshot({ path: __dirname + '/test-evidence/01-menu.png' });
  console.log('shot ok');
  await browser.close();
  console.log('DONE');
})().catch(e => { console.log('CRASH: ' + e.message); process.exit(1); });
