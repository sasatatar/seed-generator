import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function getPackageVersion(): string {
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
  const pkgJson = JSON.parse(pkgRaw) as { version?: string };
  return typeof pkgJson.version === 'string' ? pkgJson.version : 'offline';
}

test('offline zip package exists', async () => {
  const version = getPackageVersion();
  const zipPath = path.join(
    projectRoot,
    'offline-packages',
    `seed-phrase-generator-offline-${version}.zip`
  );

  expect(fs.existsSync(zipPath)).toBeTruthy();

  const stats = fs.statSync(zipPath);
  expect(stats.size).toBeGreaterThan(100_000); // sanity check: archive is not empty
});

test('offline bundle loads and generates wallets with no network', async ({ browser }) => {
  const context = await browser.newContext({ offline: true });
  const page = await context.newPage();

  page.on('console', (msg) => {
    // Helpful when debugging CI failures
    console.log(`[page-console] ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (error) => {
    console.error('[page-error]', error);
  });

  const indexPath = path.join(projectRoot, 'dist-web', 'index.html');
  await page.goto(`file://${indexPath}`, { waitUntil: 'load' });

  await expect(page.getByRole('heading', { name: /Wallet Mnemonic Generator/i })).toBeVisible();
  await expect(page.getByText('Offline Mode')).toBeVisible();

  const masterSeedInput = page.getByLabel('Master Seed (Keep Secret!)');
  await masterSeedInput.fill('test master seed');

  const generateButton = page.getByRole('button', { name: /Generate Wallets/ });
  await generateButton.click();

  await expect(page.getByRole('heading', { name: 'Generated Wallets' })).toBeVisible();
  const firstMnemonic = page.locator('code').first();
  await expect(firstMnemonic).toContainText(' ');

  await context.close();
});
