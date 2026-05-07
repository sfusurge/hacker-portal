import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import mime from 'mime-types';

const DISCORD_ATTACHMENT_MAX_BYTES = 15 * 1024 * 1024;
const ATTACHMENT_FETCH_TIMEOUT_MS = 15_000;

type DiscordR2Config = {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicBaseUrl: string;
};

export type RehostedAttachment = {
    storedUrl: string;
    storageProvider: 'r2';
    storageKey: string;
    uploadedAt: Date;
};

let cachedR2Client: S3Client | null = null;

function maybeGetDiscordR2Config(): DiscordR2Config | null {
    if (process.env.DISCORD_ATTACHMENT_REHOST_ENABLED !== 'true') {
        return null;
    }

    const endpoint = process.env.R2_ENDPOINT?.trim();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    const bucketName = process.env.R2_BUCKET_NAME?.trim();
    const publicBaseUrl =
        process.env.R2_PUBLIC_DOMAIN?.trim() ??
        process.env.DISCORD_ATTACHMENT_R2_PUBLIC_BASE_URL?.trim() ??
        process.env.R2_PUBLIC_BASE_URL?.trim();

    if (
        !endpoint ||
        !accessKeyId ||
        !secretAccessKey ||
        !bucketName ||
        !publicBaseUrl
    ) {
        return null;
    }

    return {
        endpoint,
        accessKeyId,
        secretAccessKey,
        bucketName,
        publicBaseUrl: publicBaseUrl.replace(/\/+$/, ''),
    };
}

function getR2Client(config: DiscordR2Config): S3Client {
    if (!cachedR2Client) {
        cachedR2Client = new S3Client({
            region: 'auto',
            endpoint: config.endpoint,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
    }
    return cachedR2Client;
}

function sanitizeFilename(name: string): string {
    const cleaned = name
        .trim()
        .replace(/[^\w.\-]+/g, '_')
        .replace(/_+/g, '_');
    return cleaned.length > 0 ? cleaned.slice(0, 128) : 'attachment';
}

function deriveFilename(
    sourceUrl: string,
    explicitFilename: string | null | undefined,
    fallbackIndex: number
): string {
    if (explicitFilename?.trim()) {
        return sanitizeFilename(explicitFilename);
    }

    try {
        const parsed = new URL(sourceUrl);
        const fromPath = parsed.pathname.split('/').pop();
        if (fromPath) {
            return sanitizeFilename(fromPath);
        }
    } catch {
        // ignore invalid URL here; upload path will still be deterministic.
    }

    return `attachment-${fallbackIndex}`;
}

function encodeStorageKeyForUrl(storageKey: string): string {
    return storageKey.split('/').map(encodeURIComponent).join('/');
}

export async function rehostDiscordAttachmentIfEnabled(args: {
    sourceUrl: string;
    guildId: string;
    channelId: string;
    messageId: string;
    position: number;
    filename?: string | null;
    contentType?: string | null;
}): Promise<RehostedAttachment | null> {
    const config = maybeGetDiscordR2Config();
    if (!config) {
        return null;
    }

    const attachmentFileName = deriveFilename(
        args.sourceUrl,
        args.filename,
        args.position
    );
    const storageKey =
        `discord-announcements/${args.guildId}/${args.channelId}/${args.messageId}/` +
        `${args.position}-${attachmentFileName}`;

    const response = await fetch(args.sourceUrl, {
        signal: AbortSignal.timeout(ATTACHMENT_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch Discord attachment (${response.status} ${response.statusText})`
        );
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > DISCORD_ATTACHMENT_MAX_BYTES) {
        throw new Error(
            `Attachment exceeds max rehost size (${buffer.length} bytes)`
        );
    }

    const guessedMime =
        (args.contentType && args.contentType.trim()) ||
        response.headers.get('content-type') ||
        mime.lookup(attachmentFileName) ||
        'application/octet-stream';

    const client = getR2Client(config);
    await client.send(
        new PutObjectCommand({
            Bucket: config.bucketName,
            Key: storageKey,
            Body: buffer,
            ContentType: guessedMime,
        })
    );

    const uploadedAt = new Date();

    return {
        storedUrl: `${config.publicBaseUrl}/${encodeStorageKeyForUrl(storageKey)}`,
        storageProvider: 'r2',
        storageKey,
        uploadedAt,
    };
}
