import * as bip39 from 'bip39';
import { pbkdf2Sync } from 'crypto';

/**
 * Generate a deterministic mnemonic phrase from a master seed and index
 * @param masterSeed - Your master seed phrase (keep this secret!)
 * @param index - Index number to generate different wallets (0, 1, 2, etc.)
 * @param wordCount - Number of words in the mnemonic (12, 15, 18, 21, or 24)
 * @param iterations - Number of PBKDF2 iterations (higher = more secure but slower)
 * @returns A BIP39 mnemonic phrase
 */
export function generateMnemonic(
  masterSeed: string,
  index: number,
  wordCount: 12 | 15 | 18 | 21 | 24 = 12,
  iterations: number = 10000
): string {
  // Validate word count
  const validWordCounts = [12, 15, 18, 21, 24];
  if (!validWordCounts.includes(wordCount)) {
    throw new Error(`Invalid word count. Must be one of: ${validWordCounts.join(', ')}`);
  }

  // Calculate entropy size based on word count
  // 12 words = 128 bits, 15 = 160, 18 = 192, 21 = 224, 24 = 256
  const entropyBits = (wordCount / 3) * 32;
  const entropyBytes = entropyBits / 8;

  // Create a deterministic seed by combining master seed with index
  const combinedSeed = `${masterSeed}:wallet:${index}`;
  
  // Use PBKDF2 to derive deterministic entropy from the master seed
  const entropy = pbkdf2Sync(
    combinedSeed,
    'wallet-mnemonic-salt',
    iterations,
    entropyBytes,
    'sha256'
  );

  // Generate mnemonic from the entropy
  const mnemonic = bip39.entropyToMnemonic(entropy.toString('hex'));
  
  return mnemonic;
}

/**
 * Generate multiple mnemonic phrases from a master seed
 * @param masterSeed - Your master seed phrase
 * @param count - Number of wallets to generate
 * @param wordCount - Number of words in each mnemonic
 * @param iterations - Number of PBKDF2 iterations
 * @returns Array of mnemonic phrases
 */
export function generateMultipleMnemonics(
  masterSeed: string,
  count: number,
  wordCount: 12 | 15 | 18 | 21 | 24 = 24,
  iterations: number = 10000
): string[] {
  const mnemonics: string[] = [];
  
  for (let i = 0; i < count; i++) {
    mnemonics.push(generateMnemonic(masterSeed, i, wordCount, iterations));
  }
  
  return mnemonics;
}

/**
 * Validate a BIP39 mnemonic phrase
 * @param mnemonic - The mnemonic phrase to validate
 * @returns true if valid, false otherwise
 */
export function validateMnemonic(mnemonic: string): boolean {
  return bip39.validateMnemonic(mnemonic);
}
