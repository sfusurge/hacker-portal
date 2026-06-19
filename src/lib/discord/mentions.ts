type MentionUser = {
    displayName: string;
    username: string;
};

type MentionRole = {
    name: string;
};

type MentionChannel = {
    name: string;
    type: number;
};

export type DiscordMentionMetadata = {
    users: Record<string, MentionUser>;
    roles: Record<string, MentionRole>;
    channels: Record<string, MentionChannel>;
};

const USER_MENTION_RE = /<@!?(\d+)>/g;
const ROLE_MENTION_RE = /<@&(\d+)>/g;
const CHANNEL_MENTION_RE = /<#(\d+)>/g;
const EVERYONE_HERE_RE = /@(everyone|here)\b/g;

function escapeInlineMarkdown(text: string): string {
    return text.replace(/([\\`*_[\]()~>#+\-=|{}.!])/g, '\\$1');
}

function normalizeUserMention(
    userId: string,
    mentions: DiscordMentionMetadata | null | undefined
): string {
    const user = mentions?.users?.[userId];
    if (!user) {
        return `@unknown-user-${userId}`;
    }

    const preferredName =
        user.displayName.trim() || user.username.trim() || `user-${userId}`;
    return `@${escapeInlineMarkdown(preferredName)}`;
}

function normalizeRoleMention(
    roleId: string,
    mentions: DiscordMentionMetadata | null | undefined
): string {
    const role = mentions?.roles?.[roleId];
    if (!role) {
        return `@unknown-role-${roleId}`;
    }
    return `@${escapeInlineMarkdown(role.name.trim() || `role-${roleId}`)}`;
}

function normalizeChannelMention(
    channelId: string,
    mentions: DiscordMentionMetadata | null | undefined
): string {
    const channel = mentions?.channels?.[channelId];
    if (!channel) {
        return `#unknown-channel-${channelId}`;
    }
    return `#${escapeInlineMarkdown(
        channel.name.trim() || `channel-${channelId}`
    )}`;
}

export function normalizeDiscordContentMentions(
    content: string,
    mentions: DiscordMentionMetadata | null | undefined
): string {
    if (!content) {
        return '';
    }

    return content
        .replace(USER_MENTION_RE, (_, userId: string) =>
            normalizeUserMention(userId, mentions)
        )
        .replace(ROLE_MENTION_RE, (_, roleId: string) =>
            normalizeRoleMention(roleId, mentions)
        )
        .replace(CHANNEL_MENTION_RE, (_, channelId: string) =>
            normalizeChannelMention(channelId, mentions)
        );
}

/**
 * similar to normalizeDiscordContentMentions but outputs markdown link syntax so
 * the renderer can display mentions as styled chips:
 *   <@123>  →  [@DisplayName](mention:user)
 *   <@&123> →  [@RoleName](mention:role)
 *   <#123>  →  [#ChannelName](mention:channel)
 */
export function renderDiscordContentMentions(
    content: string,
    mentions: DiscordMentionMetadata | null | undefined
): string {
    if (!content) {
        return '';
    }

    function linkText(text: string): string {
        return text.replace(/[[\]]/g, '\\$&');
    }

    return content
        .replace(USER_MENTION_RE, (_, userId: string) => {
            const user = mentions?.users?.[userId];
            const name =
                user?.displayName.trim() ||
                user?.username.trim() ||
                `unknown-user-${userId}`;
            return `[@${linkText(name)}](mention:user)`;
        })
        .replace(ROLE_MENTION_RE, (_, roleId: string) => {
            const role = mentions?.roles?.[roleId];
            const name = role?.name.trim() || `unknown-role-${roleId}`;
            return `[@${linkText(name)}](mention:role)`;
        })
        .replace(CHANNEL_MENTION_RE, (_, channelId: string) => {
            const channel = mentions?.channels?.[channelId];
            const name = channel?.name.trim() || `unknown-channel-${channelId}`;
            return `[#${linkText(name)}](mention:channel)`;
        })
        .replace(EVERYONE_HERE_RE, (_, word: string) => {
            return `[@${word}](mention:everyone)`;
        });
}

export function mentionDisplaySearchText(
    mentions: DiscordMentionMetadata | null | undefined
): string {
    if (!mentions) {
        return '';
    }

    const users = Object.values(mentions.users ?? {})
        .flatMap((user) => [user.displayName, user.username])
        .join(' ');
    const roles = Object.values(mentions.roles ?? {})
        .map((role) => role.name)
        .join(' ');
    const channels = Object.values(mentions.channels ?? {})
        .map((channel) => channel.name)
        .join(' ');

    return [users, roles, channels].join(' ').trim();
}
