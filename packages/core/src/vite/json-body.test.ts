import { Readable } from 'node:stream';
import type { Connect } from 'vite';
import { describe, expect, it } from 'vitest';
import { readJsonBodyOrError } from './json-body.ts';

function makeReq(body: string): Pick<Connect.IncomingMessage, 'on'> {
  return Readable.from([Buffer.from(body, 'utf8')]) as unknown as Pick<
    Connect.IncomingMessage,
    'on'
  >;
}

describe('readJsonBodyOrError', () => {
  it('parses valid JSON payloads', async () => {
    const req = makeReq('{"name":"deck"}');
    const result = await readJsonBodyOrError(req);
    expect(result).toEqual({
      ok: true,
      body: { name: 'deck' },
    });
  });

  it('treats empty payload as empty object', async () => {
    const req = makeReq('');
    const result = await readJsonBodyOrError(req);
    expect(result).toEqual({
      ok: true,
      body: {},
    });
  });

  it('returns 400 when JSON is malformed', async () => {
    const req = makeReq('{"name":');
    const result = await readJsonBodyOrError(req);
    expect(result).toEqual({
      ok: false,
      status: 400,
      error: 'invalid json body',
    });
  });
});
