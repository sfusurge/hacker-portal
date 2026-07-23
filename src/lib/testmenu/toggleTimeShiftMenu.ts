export function toggleTimeShiftMenu() {
    try {
        window.dispatchEvent(new Event('timeShift-toggle'));
    } catch (e) {
        console.error('Failed to dispatch timeShift-toggle', e);
    }
}
