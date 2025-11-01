import { generateMnemonic } from './mnemonic';

export interface WorkerMessage {
  type: 'generate';
  masterSeed: string;
  index: number;
  wordCount: 12 | 15 | 18 | 21 | 24;
  iterations: number;
}

export interface WorkerResponse {
  type: 'result' | 'error';
  index: number;
  mnemonic?: string;
  error?: string;
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { type, masterSeed, index, wordCount, iterations } = e.data;
  
  if (type === 'generate') {
    try {
      const mnemonic = generateMnemonic(masterSeed, index, wordCount, iterations);
      const response: WorkerResponse = {
        type: 'result',
        index,
        mnemonic,
      };
      self.postMessage(response);
    } catch (error) {
      const response: WorkerResponse = {
        type: 'error',
        index,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      self.postMessage(response);
    }
  }
};
