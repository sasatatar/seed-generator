import { generateMnemonic } from './mnemonic';

// Inline worker code as a string to avoid external file dependencies
const workerCode = `
  // Import is not available in inline workers, so we need to inline the logic
  self.onmessage = function(e) {
    const { type, masterSeed, index, wordCount, iterations } = e.data;
    
    if (type === 'generate') {
      try {
        // We'll pass the serialized function from the main thread
        const result = self.generateMnemonicInWorker(masterSeed, index, wordCount, iterations);
        self.postMessage({
          type: 'result',
          index: index,
          mnemonic: result
        });
      } catch (error) {
        self.postMessage({
          type: 'error',
          index: index,
          error: error.message
        });
      }
    }
  };
`;

/**
 * Generate multiple mnemonics asynchronously using inline Web Workers
 * @param masterSeed - Your master seed phrase
 * @param count - Number of wallets to generate
 * @param wordCount - Number of words in each mnemonic
 * @param iterations - Number of PBKDF2 iterations
 * @param onProgress - Optional callback for progress updates (index, total)
 * @returns Promise that resolves to array of mnemonic phrases
 */
export async function generateMultipleMnemonicsAsync(
  masterSeed: string,
  count: number,
  wordCount: 12 | 15 | 18 | 21 | 24 = 24,
  iterations: number = 10000,
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const results: string[] = new Array(count);
    let completedCount = 0;
    const workers: Worker[] = [];

    // Create workers (use up to 4 workers or number of wallets, whichever is smaller)
    const workerCount = Math.min(4, count);
    
    // Import the generateMnemonic function to be serialized
    const generateMnemonicCode = generateMnemonic.toString();
    
    for (let i = 0; i < workerCount; i++) {
      // Create blob with the worker code and the generateMnemonic function
      const fullWorkerCode = `
        ${generateMnemonicCode}
        self.generateMnemonicInWorker = ${generateMnemonicCode};
        ${workerCode}
      `;
      
      const blob = new Blob([fullWorkerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      const worker = new Worker(workerUrl);
      
      worker.onmessage = (e: MessageEvent) => {
        const { type, index, mnemonic, error } = e.data;
        
        if (type === 'error') {
          // Terminate all workers on error
          workers.forEach(w => {
            w.terminate();
            URL.revokeObjectURL(workerUrl);
          });
          reject(new Error(error || 'Worker error'));
          return;
        }
        
        if (type === 'result' && mnemonic) {
          results[index] = mnemonic;
          completedCount++;
          
          if (onProgress) {
            onProgress(completedCount, count);
          }
          
          if (completedCount === count) {
            // All done, terminate workers
            workers.forEach(w => {
              w.terminate();
            });
            // Revoke the blob URL
            URL.revokeObjectURL(workerUrl);
            resolve(results);
          }
        }
      };
      
      worker.onerror = (error) => {
        workers.forEach(w => {
          w.terminate();
        });
        URL.revokeObjectURL(workerUrl);
        reject(error);
      };
      
      workers.push(worker);
    }
    
    // Distribute work to workers
    for (let i = 0; i < count; i++) {
      const workerIndex = i % workerCount;
      const message = {
        type: 'generate',
        masterSeed,
        index: i,
        wordCount,
        iterations,
      };
      workers[workerIndex].postMessage(message);
    }
  });
}
