import QRCode from "qrcode";
import crypto from "crypto";

const QR_PREFIX = "JC26";

/**
 * Generate a cryptographically secure QR token
 */
export function generateQRToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Encode a QR token into the scannable payload string
 */
export function encodeQRPayload(token: string): string {
  return `${QR_PREFIX}:${token}`;
}

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

/**
 * Generate a QR code as an SVG string
 */
export async function generateQRCodeSVG(token: string): Promise<string> {
  const payload = encodeQRPayload(token);
  return QRCode.toString(payload, {
    type: "svg",
    margin: 1,
    width: 200,
    color: {
      dark: "#103E79",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H", // High error correction for reliability
  });
}

/**
 * Generate a QR code as a Data URL (for <img> tags)
 */
export async function generateQRCodeDataURL(token: string): Promise<string> {
  const payload = encodeQRPayload(token);
  return QRCode.toDataURL(payload, {
    margin: 1,
    width: 200,
    color: {
      dark: "#103E79",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "H",
  });
}
