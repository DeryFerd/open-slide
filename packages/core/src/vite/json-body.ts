import type { Connect } from 'vite';

export type JsonBodyReadResult =
  | { ok: true; body: unknown }
  | { ok: false; status: 400; error: 'invalid json body' };

export async function readJsonBodyOrError(
  req: Pick<Connect.IncomingMessage, 'on'>,
): Promise<JsonBodyReadResult> {
  return await new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let settled = false;

    const fail = () => {
      if (settled) return;
      settled = true;
      resolve({ ok: false, status: 400, error: 'invalid json body' });
    };

    req.on('data', (chunk: Buffer | string) => {
      if (settled) return;
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });

    req.on('end', () => {
      if (settled) return;
      settled = true;
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({ ok: true, body: {} });
        return;
      }
      try {
        resolve({ ok: true, body: JSON.parse(raw) });
      } catch {
        resolve({ ok: false, status: 400, error: 'invalid json body' });
      }
    });

    req.on('error', fail);
  });
}
