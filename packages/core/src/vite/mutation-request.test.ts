import { Readable } from 'node:stream';
import type { Connect } from 'vite';
import { describe, expect, it } from 'vitest';
import { readMutationJsonBodyOrError } from './mutation-request.ts';

function makeReq(
  body: string,
  headers: Record<string, string | undefined>,
): Connect.IncomingMessage {
  const req = Readable.from([Buffer.from(body, 'utf8')]) as unknown as Connect.IncomingMessage;
  req.headers = headers;
  req.socket = { encrypted: false } as unknown as Connect.IncomingMessage['socket'];
  return req;
}

describe('readMutationJsonBodyOrError', () => {
  it('accepts same-origin JSON mutation payloads', async () => {
    const req = makeReq('{"slideId":"intro"}', {
      host: 'localhost:5173',
      origin: 'http://localhost:5173',
      'content-type': 'application/json',
      'sec-fetch-site': 'same-origin',
    });

    const result = await readMutationJsonBodyOrError(req);
    expect(result).toEqual({
      ok: true,
      body: { slideId: 'intro' },
    });
  });

  it('rejects non-JSON mutation payloads', async () => {
    const req = makeReq('{"slideId":"intro"}', {
      host: 'localhost:5173',
      origin: 'http://localhost:5173',
      'content-type': 'text/plain',
    });

    const result = await readMutationJsonBodyOrError(req);
    expect(result).toEqual({
      ok: false,
      status: 415,
      error: 'content-type must be application/json',
    });
  });

  it('rejects cross-site mutation requests', async () => {
    const req = makeReq('{"slideId":"intro"}', {
      host: 'localhost:5173',
      origin: 'http://localhost:5173',
      'content-type': 'application/json',
      'sec-fetch-site': 'cross-site',
    });

    const result = await readMutationJsonBodyOrError(req);
    expect(result).toEqual({
      ok: false,
      status: 403,
      error: 'cross-site request blocked',
    });
  });

  it('returns 400 for malformed JSON payloads', async () => {
    const req = makeReq('{"slideId":', {
      host: 'localhost:5173',
      origin: 'http://localhost:5173',
      'content-type': 'application/json',
    });

    const result = await readMutationJsonBodyOrError(req);
    expect(result).toEqual({
      ok: false,
      status: 400,
      error: 'invalid json body',
    });
  });
});
