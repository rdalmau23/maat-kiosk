/**
 * Pure helper: normalises any time string to HH:MM.
 * Handles both ISO timestamps ("2026-02-28T15:24:00Z") and
 * already-short strings ("07:05") so display is consistent.
 */
export function formatTime(raw: string): string {
    if (raw.includes('T')) {
        const d = new Date(raw);
        return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return raw;
}
