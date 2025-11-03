import archiver from 'archiver';
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, unlink, access, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const distDir = path.join(projectRoot, 'dist-web');

  try {
    await access(distDir);
  } catch {
    console.error('Offline build not found. Run "pnpm build" before packaging.');
    process.exitCode = 1;
    return;
  }

  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const version = typeof packageJson.version === 'string' ? packageJson.version : 'offline';
  const folderName = 'seed-phrase-generator-offline';
  const zipName = `${folderName}-${version}.zip`;
  const publicDir = path.join(projectRoot, 'public');
  const downloadsDir = path.join(publicDir, 'downloads');
  const distDownloadsDir = path.join(distDir, 'downloads');
  const outputDir = path.join(projectRoot, 'offline-packages');
  const zipPath = path.join(outputDir, zipName);

  await mkdir(outputDir, { recursive: true });
  await mkdir(downloadsDir, { recursive: true });
  await mkdir(distDownloadsDir, { recursive: true });

  try {
    await unlink(zipPath);
  } catch (error) {
    if (!error || error.code !== 'ENOENT') {
      throw error;
    }
  }

  const output = createWriteStream(zipPath);
  const archive = archiver.create('zip', { zlib: { level: 9 } });

  const readmeContent = `Offline Wallet Mnemonic Generator\n\nThank you for downloading the offline release of the wallet mnemonic generator.\nThis package runs entirely in your browser without any network access.\n\nQuick start:\n1. Extract this zip file.\n2. Open the folder named "${folderName}".\n3. Double-click index.html (or open it from your browser's File > Open menu).\n4. Follow the on-screen instructions.\n\nSecurity best practices:\n- Disconnect from the internet before opening the file.\n- Use an air-gapped computer when possible.\n- After use, close the browser tab and clear the browser history.\n- Never share your master seed or generated mnemonics.\n\nNeed to rebuild? Visit the project repository for full source code and instructions.\n`;

  const finalizeArchive = new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`Offline package created at ${zipPath}`);
      resolve();
    });

    archive.on('warning', (warning) => {
      if (warning && warning.code === 'ENOENT') {
        console.warn(warning.message);
      } else {
        reject(warning);
      }
    });

    archive.on('error', (archiveError) => {
      reject(archiveError);
    });
  });

  archive.pipe(output);
  archive.append(readmeContent, { name: `${folderName}/README.txt` });
  archive.directory(distDir, folderName, (entry) => {
    if (entry.name === 'downloads' || entry.name.startsWith('downloads/')) {
      return false;
    }
    return entry;
  });
  await archive.finalize();
  await finalizeArchive;

  const versionedDownloadPath = path.join(downloadsDir, zipName);
  const latestDownloadPath = path.join(downloadsDir, `${folderName}-latest.zip`);
  const distVersionedDownloadPath = path.join(distDownloadsDir, zipName);
  const distLatestDownloadPath = path.join(distDownloadsDir, `${folderName}-latest.zip`);
  await copyFile(zipPath, versionedDownloadPath);
  await copyFile(zipPath, latestDownloadPath);
  await copyFile(zipPath, distVersionedDownloadPath);
  await copyFile(zipPath, distLatestDownloadPath);

  console.log(`Offline package copied to ${versionedDownloadPath}`);
  console.log(`Latest offline package available at ${latestDownloadPath}`);
  console.log(`Offline package included in distribution at ${distVersionedDownloadPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
