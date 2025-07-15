export type IconType = 'user_icon' | 'team_icon';

export function getIcon(iconType: IconType, imageName: string) {
    return `${process.env.NEXT_PUBLIC_BLOB_URL}/${iconType}/${imageName}`;
}
