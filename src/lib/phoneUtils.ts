export function normalizePhoneNumber(phone?: string | null): string {
  if (!phone) return "";
  return phone.replace(/\D/g, "");
}

export function formatForWhatsApp(phone?: string | null): string {
  const digits = normalizePhoneNumber(phone);
  if (!digits) return "";
  
  // If exactly 10 digits, assume India (+91) and prepend 91 for wa.me
  if (digits.length === 10) {
    return `91${digits}`;
  }
  
  // If it's something like 09876543210 (11 digits starting with 0), remove 0 and prepend 91
  if (digits.length === 11 && digits.startsWith('0')) {
    return `91${digits.substring(1)}`;
  }
  
  return digits;
}

export function formatForDatabase(phone?: string | null): string {
  const digits = normalizePhoneNumber(phone);
  if (!digits) return "";

  // If 10 digits, standard India number
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // If starts with 0 and has 11 digits, standard India number with 0 prefix
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.substring(1)}`;
  }

  // If it already had a '+' (e.g. +1234567890), retain it
  if (phone?.trim().startsWith('+')) {
    return `+${digits}`;
  }
  
  // If it has 12 digits and starts with 91, it's likely an Indian number with country code but no +
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  // Otherwise, if it's longer than 10 digits, assume they provided a country code without +
  if (digits.length > 10) {
    return `+${digits}`;
  }

  // Fallback
  return digits;
}
