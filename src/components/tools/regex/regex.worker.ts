import { runRegex, type RegexRequest, type RegexResult } from '@/lib/tools/regex/run';

export type WorkerRequest = { id: number; request: RegexRequest };
export type WorkerResponse = { id: number; result: RegexResult };

/* Matching runs here so a pattern that backtracks catastrophically can be killed (see run-regex). */
self.addEventListener('message', (event: MessageEvent<WorkerRequest>) => {
  const { id, request } = event.data;
  let result: RegexResult;
  try {
    result = runRegex(request);
  } catch (error) {
    // e.g. a RangeError from an output too large to build.
    result = { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
  self.postMessage({ id, result } satisfies WorkerResponse);
});
