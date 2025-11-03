# Crypto Wallet Mnemonic Generator

Generate multiple cryptocurrency wallet recovery phrases (mnemonics) from a single master seed. Available as both a **web app** and **CLI tool**.

## 🔐 Features

- 🎯 Generate multiple wallet mnemonics from one master seed
- 🌐 **Offline web interface** - works completely offline in any browser
- 💻 **CLI tool** - command-line interface for terminal users
- 🔢 Support for 12, 15, 18, 21, or 24-word mnemonics
- ✅ Built-in BIP39 validation
- 🔁 Deterministic - same inputs always produce same outputs
- 🛠️ Written in TypeScript with React + Vite + Tailwind

## ⚠️ Security Warnings

**CRITICAL: Read this before using!**

- 🔐 **Keep your master seed absolutely secret** - anyone with it can generate all your wallet mnemonics
- 💾 **Use offline only** - disconnect from internet before generating real wallets
- 📝 Consider paper backups for raw mnemonics; if you must keep a digital copy, store only the base BIP39 phrase without the secret extension
- 🧪 **Test with small amounts first** - verify each wallet works correctly
- 🚫 **Never commit secrets to version control** - already in `.gitignore`
- 🔄 **Deterministic generation** - same master seed + index always produces same mnemonic

## Installation

```bash
# Install dependencies
pnpm install
```

## Usage

### Web Interface (Recommended for Offline Use)

```bash
# Development mode
pnpm dev

# Build for offline use
pnpm build

# Create a zip bundle you can share
pnpm build:offline

# Open dist-web/index.html in any browser (works completely offline!)

# Run automated smoke test of the packaged bundle
pnpm test:offline
```

`pnpm build:offline` writes a ready-to-run archive to `offline-packages/seed-phrase-generator-offline-<version>.zip`.

**For maximum security**: Build the web version, copy `dist-web/` to a USB drive, and use on an air-gapped computer. See [OFFLINE-BUILD.md](./OFFLINE-BUILD.md) for detailed instructions.

### Command Line Interface

```bash
# Generate 3 wallets with 12-word mnemonics (default)
pnpm dev:cli "your-master-seed-phrase"

# Generate 5 wallets with 24-word mnemonics
pnpm dev:cli "your-master-seed-phrase" 5 24

# Build CLI version
pnpm build:cli
node dist-cli/cli.js "your-master-seed" 3 12
```

## Plausible Deniability Strategy

You can use a valid BIP39 seed phrase as your base seed, combined with a secret word, to create plausible deniability:

```bash
# Decoy wallets (small amounts - can reveal under duress)
pnpm dev:cli "your 24 word valid bip39 mnemonic phrase here" 1 24

# Real wallets (your actual funds - secret word never revealed)
pnpm dev:cli "your 24 word valid bip39 mnemonic phrase here SECRET_WORD" 5 24
```

**Strategy:**
- Base seed: A valid 24-word BIP39 mnemonic (can be revealed)
- Secret word: Memorized passphrase never written down
- Decoy wallets: Created from base seed only (keep small amounts)
- Real wallets: Created from base seed + secret word (your actual funds)

**Backup guidance:** Keep an encrypted digital copy of the base mnemonic (decoy) wherever convenient, but never store the secret extension alongside it. The real funds remain safe as long as the secret extension stays offline.

⚠️ **Critical**: If you forget the secret word, your real wallets are lost forever!

## How It Works

1. **Master Seed**: You provide a secret master seed (any string)
2. **Index Derivation**: For each wallet, the script combines your master seed with an index number (0, 1, 2, etc.)
3. **Key Derivation**: Uses PBKDF2 with 100,000 iterations to derive deterministic entropy
4. **Mnemonic Generation**: Converts the entropy to a valid BIP39 mnemonic phrase

The process is deterministic - the same master seed and index will always produce the same mnemonic.

## Mnemonic Word Counts

- **12 words** (128 bits) - Standard, widely supported
- **15 words** (160 bits) - Higher security
- **18 words** (192 bits) - High security
- **21 words** (224 bits) - Very high security
- **24 words** (256 bits) - Maximum security

## Building

```bash
# Compile TypeScript to JavaScript
pnpm build

# Run the compiled version
pnpm start "your-master-seed" 3 12
```

## Example Output

```
🔐 Crypto Wallet Mnemonic Generator
=====================================

Generating 3 wallet(s) with 12-word mnemonics...

Wallet #1:
  abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
  Valid: ✓

Wallet #2:
  example mnemonic phrase here with twelve words total for recovery purposes
  Valid: ✓

Wallet #3:
  another unique mnemonic generated from the same master seed deterministically
  Valid: ✓

⚠️  IMPORTANT:
  - Write down each mnemonic phrase and store it securely
  - Test each wallet with a small amount first
  - Keep your master seed safe - it can regenerate all these mnemonics
  - These mnemonics are deterministic - same seed + index = same mnemonic
```

## Best Practices

1. **Master Seed Selection**:
   - Use a long, random, unique passphrase
   - Consider using a password manager to generate it
   - Never reuse passwords or common phrases

2. **Backup Strategy (Plausible Deniability)**:
  - Use a valid BIP39 seed as your base mnemonic and keep the secret extension separate.
  - You may store the base mnemonic (decoy) in encrypted digital backups or cloud storage; it is incomplete without the secret extension.
  - Keep the secret extension offline (paper, metal plate, or hardware password manager) and never record it with the base mnemonic.
  - Log which wallets are decoy versus real and the exact parameters (word count, iterations, indices).

3. **Usage**:
   - Generate wallets offline when possible
   - Test each wallet with a small amount first
   - Keep records of which index corresponds to which wallet
   - Consider using different master seeds for different purposes

4. **Recovery**:
   - If you lose a wallet mnemonic but have the master seed, you can regenerate it
   - Keep track of the index number for each wallet
   - Document your generation parameters (word count, etc.)

## Technical Details

- **Algorithm**: PBKDF2-SHA256 with 100,000 iterations
- **Standard**: BIP39 (Bitcoin Improvement Proposal 39)
- **Entropy**: Derived deterministically from master seed + index
- **Salt**: Fixed salt for consistency across runs

## License

MIT

## Disclaimer

This tool is provided as-is for educational and personal use. The authors are not responsible for any loss of funds. Always test thoroughly and understand the risks before using with real cryptocurrency. Never trust code you don't understand - review the source code yourself or have it audited.
