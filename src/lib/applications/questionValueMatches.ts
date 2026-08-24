/**
 * Match a stored answer against a visibleWhen/disabledWhen target value.
 * Supports both single-select (`string`) and multi-select (`string[]`) answers.
 */
export function questionValueMatches(
    value: unknown,
    expected: string
): boolean {
    if (Array.isArray(value)) {
        return value.includes(expected);
    }
    return value === expected;
}
