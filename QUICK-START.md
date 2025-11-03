# Quick Start Guide

## 🎯 What You Have

A complete crypto wallet mnemonic generator with:
- ✅ **Web Interface** - Modern React app (works offline)
- ✅ **CLI Tool** - Command-line interface
- ✅ **One package.json** - Unified project structure
- ✅ **Plausible Deniability** - Support for decoy + secret word strategy

## 🚀 Quick Commands

### Web Interface
```bash
# Run in development
pnpm dev
# Opens at http://localhost:5173

# Build for offline use
pnpm build
# Output: dist-web/index.html (open in any browser, works offline!)
```

### CLI Tool
```bash
# Generate wallets from command line
pnpm dev:cli "your-master-seed" 3 12
pnpm dev:cli "your-master-seed" 5 24

# Build CLI
pnpm build:cli
# Output: dist-cli/cli.js
```

## 🔐 Security Features

### Offline Mode
The web app:
- ✅ Detects if you're online and warns you
- ✅ Can be built into a single HTML file
- ✅ Works completely offline (no network calls)
- ✅ All crypto libraries bundled

### Plausible Deniability
```bash
# Decoy wallets (can reveal under duress)
pnpm dev:cli "valid 24 word seed phrase" 1 24

# Real wallets (never reveal secret word)
pnpm dev:cli "valid 24 word seed phrase SECRET" 5 24
```

## 📁 Project Structure

```
src/
├── lib/
│   └── mnemonic.ts    # Core crypto logic (shared by web & CLI)
├── cli.ts             # CLI interface
├── App.tsx            # React web interface
├── main.tsx           # React entry point
└── index.css          # Tailwind styles

Configuration:
├── package.json       # Unified dependencies
├── vite.config.ts     # Vite + crypto polyfills
├── tsconfig.json      # React/Web TypeScript config
├── tsconfig.cli.json  # CLI TypeScript config
└── tailwind.config.js # Tailwind CSS config
```

## 🎨 Web Interface Features

- 🟢 **Online/Offline Detection** - Visual warning if connected
- 🔢 **Configurable Options** - 12-24 words, multiple wallets
- 📋 **Copy to Clipboard** - Easy copying of mnemonics
- ✅ **Live Validation** - Instant BIP39 validation
- 🎨 **Modern UI** - Dark theme with Tailwind CSS
- ⚠️ **Security Warnings** - Prominent safety reminders

## 🔧 For Maximum Security

1. **Build the offline version:**
   ```bash
   pnpm build
   ```

2. **Copy to USB drive:**
   ```bash
   cp -r dist-web /path/to/usb/wallet-generator
   ```

3. **Use on air-gapped computer:**
   - Never connected to internet
   - Open index.html from USB
   - Generate wallets
   - Write mnemonics on paper
   - Clear browser cache

## 📚 Documentation

- `README.md` - Main documentation
- `OFFLINE-BUILD.md` - Detailed offline build guide
- This file - Quick reference

## ✨ Key Features

- **Deterministic**: Same seed + index = same mnemonic (always)
- **BIP39 Standard**: Industry-standard mnemonic generation
- **PBKDF2**: 100,000 iterations for key derivation
- **No Network**: Zero external calls (verifiable)
- **TypeScript**: Full type safety
- **Modern Stack**: React + Vite + Tailwind

## 🧪 Testing

```bash
# Test CLI
pnpm dev:cli "test-seed" 2 12

# Test Web (in browser)
pnpm dev
# Navigate to http://localhost:5173
# Enter "test-seed", generate, verify results

# Verify offline build
pnpm build
# Disconnect from internet
# Open dist-web/index.html
# Should work perfectly offline
```

## ⚠️ Remember

1. **Master seed = all wallets** - Keep it secret!
2. **Test first** - Use small amounts initially
3. **Offline only** - For real funds, disconnect internet
4. **Paper backups** - Write mnemonics, don't store digitally
5. **Verify everything** - Audit code before trusting with funds

## 🎯 Next Steps

1. Test with dummy seed phrases
2. Verify offline functionality
3. Audit the crypto code (`src/lib/mnemonic.ts`)
4. Build offline version for air-gapped use
5. Test with small amounts before real funds

---

**Ready to use!** The web app is running at http://localhost:5173 and you can build the offline version with `pnpm build`.
