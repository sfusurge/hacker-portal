export const TIME_SHIFT_VISIBILITY_KEY = 'timeShift.visible';

export function toggleTimeShiftMenu() {
    try {
        const prev = localStorage.getItem(TIME_SHIFT_VISIBILITY_KEY) === 'true';
        localStorage.setItem(
            TIME_SHIFT_VISIBILITY_KEY,
            prev ? 'false' : 'true'
        );
    } catch (e) {
        console.error('Failed to toggle timeShift.visible', e);
    }

    try {
        window.dispatchEvent(new Event('timeShift-toggle'));
    } catch (e) {
        console.error('Failed to dispatch timeShift-toggle', e);
    }
}
