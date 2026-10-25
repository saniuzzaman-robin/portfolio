import { bcryptCompare, bcryptHash } from '@/lib/tools/crypto/bcrypt';

export type BcryptRequest =
  | { kind: 'hash'; password: string; cost: number }
  | { kind: 'compare'; password: string; hash: string };

export type BcryptResponse =
  | { ok: true; kind: 'hash'; hash: string }
  | { ok: true; kind: 'compare'; match: boolean }
  | { ok: false; error: string };

/* bcrypt is slow on purpose (a cost of 12 takes ~0.5 s); running it here keeps the page responsive. */
self.addEventListener('message', (event: MessageEvent<BcryptRequest>) => {
  const request = event.data;
  const work: Promise<BcryptResponse> =
    request.kind === 'hash'
      ? bcryptHash(request.password, request.cost).then((hash) => ({
          ok: true,
          kind: 'hash',
          hash,
        }))
      : bcryptCompare(request.password, request.hash).then((match) => ({
          ok: true,
          kind: 'compare',
          match,
        }));
  work
    .catch((error: unknown): BcryptResponse => ({
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }))
    .then((response) => self.postMessage(response));
});
