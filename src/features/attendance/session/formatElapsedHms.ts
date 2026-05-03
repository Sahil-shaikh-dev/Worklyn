/**
 * Formats elapsed milliseconds as `H:MM:SS` (hours may exceed 99).
 * Floors to whole seconds.
 */
export function formatElapsedAsHms(totalMs: number): string {
  if (totalMs < 0) {
    return '0:00:00';
  }
  const totalSec = Math.floor(totalMs / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
