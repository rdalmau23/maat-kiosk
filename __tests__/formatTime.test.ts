/** @jest-environment node */
import { formatTime } from '../utils/formatTime';

describe('formatTime', () => {
    it('returns HH:MM unchanged when already short', () => {
        expect(formatTime('07:05')).toBe('07:05');
        expect(formatTime('23:59')).toBe('23:59');
    });

    it('converts an ISO timestamp to HH:MM', () => {
        // Use UTC offset to make this timezone-deterministic
        const isoUTC = '2026-02-28T14:30:00Z';
        const result = formatTime(isoUTC);
        // Result depends on local timezone, but must match HH:MM pattern
        expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('handles ISO timestamp with timezone offset', () => {
        const iso = '2026-02-28T09:05:00+01:00';
        const result = formatTime(iso);
        expect(result).toMatch(/^\d{2}:\d{2}$/);
    });
});
