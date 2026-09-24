/**
 * QR payload decoder — client-safe (no Node.js dependencies)
 */

const QR_PREFIX = "JC26";

/**
 * Decode a scanned QR payload back into a token
 * Returns null if the payload is invalid
 */
export function decodeQRPayload(payload: string): string | null {
  if (!payload.startsWith(`${QR_PREFIX}:`)) return null;
  const token = payload.slice(QR_PREFIX.length + 1);
  if (token.length !== 32 || !/^[a-f0-9]+$/.test(token)) return null;
  return token;
}
