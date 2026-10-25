'use client';

import type { BcryptRequest, BcryptResponse } from './bcrypt.worker';

/**
 * Runs one bcrypt job in a fresh worker. Aborting terminates the worker, so a superseded hash
 * (the user kept typing) stops using CPU immediately.
 */
export function runBcrypt(request: BcryptRequest, signal: AbortSignal): Promise<BcryptResponse> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./bcrypt.worker.ts', import.meta.url), { type: 'module' });
    const onAbort = () => {
      worker.terminate();
      reject(signal.reason);
    };
    signal.addEventListener('abort', onAbort, { once: true });
    const finish = () => {
      signal.removeEventListener('abort', onAbort);
      worker.terminate();
    };
    worker.addEventListener('message', (event: MessageEvent<BcryptResponse>) => {
      finish();
      resolve(event.data);
    });
    worker.addEventListener('error', (event) => {
      finish();
      reject(new Error(event.message || 'The bcrypt worker failed to start.'));
    });
    worker.postMessage(request);
  });
}
