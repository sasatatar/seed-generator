import type { WorkerMessage, WorkerResponse } from './mnemonic.worker';
// Import the worker using Vite's ?worker syntax
import MnemonicWorker from './mnemonic.worker.ts?worker';

/**
 * Generate multiple mnemonics asynchronously using Web Workers
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
    
    for (let i = 0; i < workerCount; i++) {
      const worker = new MnemonicWorker();
      
      worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
        const { type, index, mnemonic, error } = e.data;
        
        if (type === 'error') {
          // Terminate all workers on error
          workers.forEach(w => w.terminate());
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
            workers.forEach(w => w.terminate());
            resolve(results);
          }
        }
      };
      
      worker.onerror = (error) => {
        workers.forEach(w => w.terminate());
        reject(error);
      };
      
      workers.push(worker);
    }
    
    // Distribute work to workers
    for (let i = 0; i < count; i++) {
      const workerIndex = i % workerCount;
      const message: WorkerMessage = {
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
