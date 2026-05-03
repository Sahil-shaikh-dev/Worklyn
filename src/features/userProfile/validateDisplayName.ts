export const DISPLAY_NAME_MIN_LEN = 3;

export function isValidDisplayName(name: string): boolean {
  const t = name.trim();
  return t.length >= DISPLAY_NAME_MIN_LEN;
}

/** Error message for invalid trimmed input, or null if valid. */
export function getDisplayNameValidationError(name: string): string | null {
  const t = name.trim();
  if (t.length < DISPLAY_NAME_MIN_LEN) {
    return `Enter at least ${DISPLAY_NAME_MIN_LEN} characters.`;
  }
  return null;
}

/**
 * Title-style capitalization for header greeting (whitespace-separated words).
 * Display-only; stored value is unchanged.
 */
export function formatDisplayNameForHeader(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}
