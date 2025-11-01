import { generateMultipleMnemonics, validateMnemonic } from './lib/mnemonic';

// CLI Usage
const args = process.argv.slice(2);

if (args.length < 1) {
  console.log('Usage: pnpm dev:cli <master-seed> [count] [word-count]');
  console.log('');
  console.log('Arguments:');
  console.log('  master-seed  - Your master seed (keep this secret!)');
  console.log('  count        - Number of wallets to generate (default: 3)');
  console.log('  word-count   - Words per mnemonic: 12, 15, 18, 21, or 24 (default: 12)');
  console.log('');
  console.log('Example:');
  console.log('  pnpm dev:cli "my-super-secret-master-seed" 5 12');
  console.log('');
  console.log('⚠️  SECURITY WARNING:');
  console.log('  - Keep your master seed absolutely secret');
  console.log('  - Anyone with your master seed can generate all your wallet mnemonics');
  console.log('  - Store it securely offline (paper backup, encrypted storage, etc.)');
  console.log('  - Never share it or commit it to version control');
  process.exit(1);
}

const masterSeed = args[0];
const count = parseInt(args[1] || '3');
const wordCount = parseInt(args[2] || '12') as 12 | 15 | 18 | 21 | 24;

console.log('🔐 Crypto Wallet Mnemonic Generator');
console.log('=====================================\n');
console.log(`Generating ${count} wallet(s) with ${wordCount}-word mnemonics...\n`);

try {
  const mnemonics = generateMultipleMnemonics(masterSeed, count, wordCount);
  
  mnemonics.forEach((mnemonic, index) => {
    console.log(`Wallet #${index + 1}:`);
    console.log(`  ${mnemonic}`);
    console.log(`  Valid: ${validateMnemonic(mnemonic) ? '✓' : '✗'}`);
    console.log('');
  });

  console.log('⚠️  IMPORTANT:');
  console.log('  - Write down each mnemonic phrase and store it securely');
  console.log('  - Test each wallet with a small amount first');
  console.log('  - Keep your master seed safe - it can regenerate all these mnemonics');
  console.log('  - These mnemonics are deterministic - same seed + index = same mnemonic');
} catch (error) {
  console.error('Error:', error instanceof Error ? error.message : error);
  process.exit(1);
}
