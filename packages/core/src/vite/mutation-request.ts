import type { Connect } from 'vite';
import { readJsonBodyOrError } from './json-body.ts';
import { validateMutationRequest } from './request-guard.ts';

export type MutationJsonBodyReadResult =
  | { ok: true; body: unknown }
  | { ok: false; status: number; error: string };

export async function readMutationJsonBodyOrError(
  req: Connect.IncomingMessage,
): Promise<MutationJsonBodyReadResult> {
  const requestCheck = validateMutationRequest(req, { requireJsonBody: true });
  if (!requestCheck.ok) return requestCheck;

  const bodyResult = await readJsonBodyOrError(req);
  if (!bodyResult.ok) return bodyResult;

  return { ok: true, body: bodyResult.body };
}
