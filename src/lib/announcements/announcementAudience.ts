export const GLOBAL_AUDIENCE_SELECT_VALUE = '__global__';

export type AnnouncementAudienceOption = {
    locationKey: string | null;
    label: string;
};

export function audienceSelectValue(locationKey: string | null): string {
    return locationKey ?? GLOBAL_AUDIENCE_SELECT_VALUE;
}

export function audienceFromSelectValue(value: string): string | null {
    return value === GLOBAL_AUDIENCE_SELECT_VALUE ? null : value;
}
