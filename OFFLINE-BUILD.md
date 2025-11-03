# Building for Offline Use

This guide explains how to build a completely offline, standalone version of the wallet mnemonic generator.

## Quick Start

```bash
# 1. Build the offline web version
pnpm build

# 2. The output will be in dist-web/
# 3. Open dist-web/index.html in any browser (no server needed!)
```

## What Gets Built

The build process creates:
- `dist-web/index.html` - Single HTML file with all JavaScript and CSS inlined
- All crypto libraries bundled and included
- No external dependencies or network calls

## Using the Offline Version

### Method 1: Direct File Opening
1. Navigate to `dist-web/` folder
2. Double-click `index.html`
3. It opens in your default browser - completely offline!

### Method 2: USB Drive (Recommended for Security)
1. Copy the entire `dist-web/` folder to a USB drive
2. Use on an air-gapped computer (never connected to internet)
3. Open `index.html` from the USB drive

### Method 3: Air-Gapped Computer
1. Build on your main computer
2. Transfer `dist-web/` folder via USB to an offline computer
3. Use exclusively on the offline machine

## Verifying No Network Calls

### Option 1: Browser Developer Tools
1. Open the offline HTML file
2. Press F12 to open DevTools
3. Go to Network tab
4. Generate wallets
5. Verify: No network requests should appear

### Option 2: Disconnect from Internet
1. Turn off WiFi and unplug ethernet
2. Try to load any website - should fail
3. Open the offline HTML file - should work perfectly
4. Generate wallets - should work without any errors

### Option 3: Check the Source Code
All crypto operations happen in `src/lib/mnemonic.ts`:
- Uses `crypto.pbkdf2Sync` (Node.js crypto, polyfilled for browser)
- Uses `bip39` library (bundled, no external calls)
- No fetch(), XMLHttpRequest, or any network APIs

## Security Best Practices

### For Maximum Security:
1. **Build on a clean system**
   ```bash
   # Clone repository
   git clone <your-repo>
   cd password-storage
   
   # Install dependencies
   pnpm install
   
   # Build offline version
   pnpm build
   ```

2. **Transfer to air-gapped computer**
   - Copy `dist-web/` to USB drive
   - Move to computer that has NEVER been online
   - Or disconnect from internet permanently

3. **Verify the build**
   ```bash
   # Check that files are self-contained
   ls -lh dist-web/
   
   # Should see index.html with all assets inlined
   ```

4. **Use offline only**
   - Disconnect from internet before opening
   - Generate wallets
   - Write mnemonics on paper (not digitally)
   - Clear browser cache after use

## CLI Tool (Alternative)

If you prefer command-line:

```bash
# Run CLI tool directly
pnpm dev:cli "your-master-seed" 5 24

# Or build CLI version
pnpm build:cli
node dist-cli/cli.js "your-master-seed" 5 24
```

The CLI tool works without any browser and has zero network calls.

## File Structure After Build

```
password-storage/
├── dist-web/          # Web version (for browsers)
│   ├── index.html     # All-in-one offline file
│   └── assets/        # (optional, may be inlined)
├── dist-cli/          # CLI version (for terminal)
│   └── cli.js         # Command-line tool
└── src/               # Source code
    ├── App.tsx        # React UI
    ├── cli.ts         # CLI interface
    └── lib/
        └── mnemonic.ts # Core crypto logic
```

## Troubleshooting

### "Module not found" errors
```bash
pnpm install  # Reinstall dependencies
pnpm build
```

### Large file size
This is normal! All crypto libraries are bundled for offline use.
Typical size: 1-3 MB for the complete package.

### Browser compatibility
Works in all modern browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Advanced: Audit the Code

Before trusting this with real funds:

1. **Review the crypto logic**
   ```bash
   cat src/lib/mnemonic.ts  # Check the mnemonic generation
   cat src/cli.ts           # Check CLI implementation
   ```

2. **Check for network calls**
   ```bash
   grep -r "fetch\|XMLHttpRequest\|axios\|http\." src/
   # Should return nothing or only comments
   ```

3. **Verify dependencies**
   ```bash
   cat package.json  # Review all dependencies
   ```

4. **Build from source yourself**
   - Never trust pre-built binaries
   - Always build from source code you've reviewed
   - Compare checksums if sharing builds

## Why This is Safe

1. ✅ **No network code** - Zero fetch/XHR calls in source
2. ✅ **All assets bundled** - No CDN dependencies
3. ✅ **Standard crypto** - Uses BIP39 and PBKDF2
4. ✅ **Verifiable build** - You build it yourself
5. ✅ **Open source** - Audit the entire codebase
6. ✅ **Deterministic** - Same seed = same wallets always

## License

MIT - Use at your own risk. Always test with small amounts first.
