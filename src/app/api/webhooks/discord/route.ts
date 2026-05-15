import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { databaseClient } from '@/db/client';
import { rehostDiscordAttachmentIfEnabled } from '@/lib/discord/attachmentRehost';
import {
    announcementAttachments,
    announcementChannelMappings,
    announcements,
    deleteDiscordAnnouncementSchema,
    ingestDiscordAnnouncementSchema,
    type AnnouncementWithAttachments,
} from '@/db/schema/announcements';
import { publishAnnouncementEvent } from '@/lib/realtime/publishAnnouncementEvent';
import { loadAnnouncementRealtimeSnapshot } from '@/server/announcements/loadAnnouncementRealtimeSnapshot';
const INGEST_LOG_EVENT = 'discord_announcements_ingest';

type IngestStatus = 'created' | 'duplicate' | 'updated';

type IngestResult = {
    id: number;
    status: IngestStatus;
    hackathonId: number;
};

type DeleteResult =
    | { id: number; status: 'archived' | 'duplicate'; hackathonId: number }
    | { status: 'not_found' };

type IngestPayload = z.infer<typeof ingestDiscordAnnouncementSchema>;

type ExistingAnnouncement = {
    id: number;
    hackathonId: number;
    lastEditedAt: Date | null;
};

type AnnouncementDeleteRow = {
    id: number;
    hackathonId: number;
    isArchived: boolean;
};

const globalForDiscordIngest = globalThis as unknown as {
    discordIngestRateLimitBuckets?: Map<number, number>;
};

const rateLimitBuckets =
    globalForDiscordIngest.discordIngestRateLimitBuckets ??
    new Map<number, number>();

globalForDiscordIngest.discordIngestRateLimitBuckets = rateLimitBuckets;

function parseRateLimitPerMinute(): number {
    const raw = process.env.DISCORD_INGEST_RATE_LIMIT_PER_MINUTE ?? '120';
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 120;
}

function isIngestEnabled(): boolean {
    return process.env.DISCORD_INGEST_ENABLED !== 'false';
}

function announcementRecordForAbly(
    announcement: AnnouncementWithAttachments
): Record<string, unknown> {
    return JSON.parse(JSON.stringify(announcement)) as Record<string, unknown>;
}

async function publishAnnouncementLive(
    kind: 'created' | 'updated',
    announcementId: number,
    fallbackHackathonId: number
): Promise<void> {
    const snap = await loadAnnouncementRealtimeSnapshot(announcementId);
    if (!snap) {
        await publishAnnouncementEvent({
            kind,
            hackathonId: fallbackHackathonId,
            announcementId,
        });
        return;
    }
    await publishAnnouncementEvent({
        kind,
        hackathonId: snap.announcement.hackathonId,
        announcementId: snap.announcement.id,
        announcement: announcementRecordForAbly(snap.announcement),
        visibility: snap.visibility,
    });
}

function consumeRateLimitToken(): boolean {
    const minute = Math.floor(Date.now() / 60_000);
    const limit = parseRateLimitPerMinute();
    const next = (rateLimitBuckets.get(minute) ?? 0) + 1;
    if (next > limit) {
        return false;
    }
    rateLimitBuckets.set(minute, next);
    for (const key of rateLimitBuckets.keys()) {
        if (key < minute - 2) {
            rateLimitBuckets.delete(key);
        }
    }
    return true;
}

function ingestLog(fields: Record<string, unknown>): void {
    console.info(
        JSON.stringify({
            event: INGEST_LOG_EVENT,
            ts: new Date().toISOString(),
            ...fields,
        })
    );
}

function verifyBearer(request: NextRequest): boolean {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.DISCORD_INGEST_SECRET?.trim();
    if (!secret) {
        return false;
    }
    return authHeader === `Bearer ${secret}`;
}

async function findExistingAnnouncement(
    sourceMessageId: string
): Promise<ExistingAnnouncement | undefined> {
    const [existing] = await databaseClient
        .select({
            id: announcements.id,
            hackathonId: announcements.hackathonId,
            lastEditedAt: announcements.lastEditedAt,
        })
        .from(announcements)
        .where(
            and(
                eq(announcements.source, 'discord'),
                eq(announcements.sourceMessageId, sourceMessageId)
            )
        )
        .limit(1);

    return existing;
}

async function findAnnouncementForDelete(
    sourceMessageId: string
): Promise<AnnouncementDeleteRow | undefined> {
    const [row] = await databaseClient
        .select({
            id: announcements.id,
            hackathonId: announcements.hackathonId,
            isArchived: announcements.isArchived,
        })
        .from(announcements)
        .where(
            and(
                eq(announcements.source, 'discord'),
                eq(announcements.sourceMessageId, sourceMessageId)
            )
        )
        .limit(1);

    return row;
}

function buildAttachmentRows(announcementId: number, payload: IngestPayload) {
    return Promise.all(
        payload.attachments.map(async (attachment, index) => {
            let rehosted: Awaited<
                ReturnType<typeof rehostDiscordAttachmentIfEnabled>
            > = null;

            try {
                rehosted = await rehostDiscordAttachmentIfEnabled({
                    sourceUrl: attachment.url,
                    guildId: payload.guildId,
                    channelId: payload.channelId,
                    messageId: payload.messageId,
                    position: index,
                    filename: attachment.filename,
                    contentType: attachment.contentType,
                });
            } catch (error) {
                ingestLog({
                    method: 'POST',
                    outcome: 'attachment_rehost_failed',
                    messageId: payload.messageId,
                    channelId: payload.channelId,
                    guildId: payload.guildId,
                    position: index,
                    errorName:
                        error instanceof Error ? error.name : 'unknown_error',
                    errorMessage:
                        error instanceof Error
                            ? error.message
                            : 'unknown error while rehosting attachment',
                });
            }

            return {
                announcementId,
                sourceUrl: attachment.url,
                storedUrl: rehosted?.storedUrl ?? null,
                storageProvider: rehosted?.storageProvider ?? null,
                storageKey: rehosted?.storageKey ?? null,
                uploadedAt: rehosted?.uploadedAt ?? null,
                filename: attachment.filename ?? null,
                contentType: attachment.contentType ?? null,
                sizeBytes: attachment.sizeBytes ?? null,
                width: attachment.width ?? null,
                height: attachment.height ?? null,
                position: index,
            };
        })
    );
}

export async function POST(request: NextRequest) {
    const start = Date.now();
    const method = 'POST';

    if (!verifyBearer(request)) {
        ingestLog({
            method,
            outcome: 'unauthorized',
            httpStatus: 401,
            durationMs: Date.now() - start,
        });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isIngestEnabled()) {
        ingestLog({
            method,
            outcome: 'disabled',
            httpStatus: 403,
            durationMs: Date.now() - start,
        });
        return NextResponse.json(
            { error: 'Discord ingest disabled' },
            { status: 403 }
        );
    }

    if (!consumeRateLimitToken()) {
        ingestLog({
            method,
            outcome: 'rate_limited',
            httpStatus: 429,
            durationMs: Date.now() - start,
        });
        return NextResponse.json(
            { error: 'Discord ingest rate limit exceeded' },
            { status: 429 }
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        ingestLog({
            method,
            outcome: 'invalid_json',
            httpStatus: 400,
            durationMs: Date.now() - start,
        });
        return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
        );
    }

    const parsed = ingestDiscordAnnouncementSchema.safeParse(body);
    if (!parsed.success) {
        ingestLog({
            method,
            outcome: 'validation_error',
            httpStatus: 400,
            durationMs: Date.now() - start,
        });
        return NextResponse.json(
            {
                error: 'Invalid request body',
                details: parsed.error.flatten(),
            },
            { status: 400 }
        );
    }

    const payload = parsed.data;
    const idempotencyKey = payload.idempotencyKey ?? payload.messageId;
    const editedAt = payload.editedTimestamp
        ? new Date(payload.editedTimestamp)
        : null;
    const isEdit = Boolean(editedAt);
    const attachmentCount = payload.attachments.length;

    try {
        const existing = await findExistingAnnouncement(payload.messageId);

        if (existing) {
            const isDuplicate =
                !editedAt ||
                (existing.lastEditedAt &&
                    editedAt.getTime() <= existing.lastEditedAt.getTime());

            if (isDuplicate) {
                ingestLog({
                    method,
                    outcome: 'duplicate',
                    httpStatus: 200,
                    durationMs: Date.now() - start,
                    messageId: payload.messageId,
                    channelId: payload.channelId,
                    guildId: payload.guildId,
                    hackathonId: existing.hackathonId,
                    attachmentCount,
                    isEdit,
                });
                return NextResponse.json<IngestResult>(
                    {
                        id: existing.id,
                        status: 'duplicate',
                        hackathonId: existing.hackathonId,
                    },
                    { status: 200 }
                );
            }

            await databaseClient.transaction(async (tx) => {
                await tx
                    .update(announcements)
                    .set({
                        content: payload.content,
                        mentionMetadata: payload.mentions,
                        lastEditedAt: editedAt,
                        rawPayload: payload.rawPayload ?? null,
                        updatedAt: new Date(),
                    })
                    .where(eq(announcements.id, existing.id));

                await tx
                    .delete(announcementAttachments)
                    .where(
                        eq(announcementAttachments.announcementId, existing.id)
                    );

                if (payload.attachments.length > 0) {
                    const attachmentRows = await buildAttachmentRows(
                        existing.id,
                        payload
                    );
                    await tx
                        .insert(announcementAttachments)
                        .values(attachmentRows);
                }
            });

            ingestLog({
                method,
                outcome: 'updated',
                httpStatus: 200,
                durationMs: Date.now() - start,
                messageId: payload.messageId,
                channelId: payload.channelId,
                guildId: payload.guildId,
                hackathonId: existing.hackathonId,
                attachmentCount,
                isEdit: true,
            });
            await publishAnnouncementLive(
                'updated',
                existing.id,
                existing.hackathonId
            );
            return NextResponse.json<IngestResult>(
                {
                    id: existing.id,
                    status: 'updated',
                    hackathonId: existing.hackathonId,
                },
                { status: 200 }
            );
        }

        const [mapping] = await databaseClient
            .select({
                hackathonId: announcementChannelMappings.hackathonId,
            })
            .from(announcementChannelMappings)
            .where(
                and(
                    eq(
                        announcementChannelMappings.discordChannelId,
                        payload.channelId
                    ),
                    eq(
                        announcementChannelMappings.discordGuildId,
                        payload.guildId
                    ),
                    eq(announcementChannelMappings.isActive, true)
                )
            )
            .limit(1);

        if (!mapping) {
            ingestLog({
                method,
                outcome: 'mapping_miss',
                httpStatus: 422,
                durationMs: Date.now() - start,
                messageId: payload.messageId,
                channelId: payload.channelId,
                guildId: payload.guildId,
                attachmentCount,
                isEdit,
            });
            return NextResponse.json(
                {
                    error: 'No active channel mapping found',
                    channelId: payload.channelId,
                    guildId: payload.guildId,
                },
                { status: 422 }
            );
        }

        const created = await databaseClient.transaction(async (tx) => {
            const [row] = await tx
                .insert(announcements)
                .values({
                    hackathonId: mapping.hackathonId,
                    source: 'discord',
                    sourceMessageId: payload.messageId,
                    sourceChannelId: payload.channelId,
                    sourceGuildId: payload.guildId,
                    sourceAuthorId: payload.authorId,
                    idempotencyKey,
                    content: payload.content,
                    mentionMetadata: payload.mentions,
                    rawPayload: payload.rawPayload ?? null,
                    sourceTimestamp: new Date(payload.timestamp),
                    lastEditedAt: editedAt,
                })
                .returning({
                    id: announcements.id,
                    hackathonId: announcements.hackathonId,
                });

            if (payload.attachments.length > 0) {
                const attachmentRows = await buildAttachmentRows(
                    row.id,
                    payload
                );
                await tx.insert(announcementAttachments).values(attachmentRows);
            }

            return row;
        });

        ingestLog({
            method,
            outcome: 'created',
            httpStatus: 201,
            durationMs: Date.now() - start,
            messageId: payload.messageId,
            channelId: payload.channelId,
            guildId: payload.guildId,
            hackathonId: created.hackathonId,
            attachmentCount,
            isEdit,
        });
        await publishAnnouncementLive(
            'created',
            created.id,
            created.hackathonId
        );
        return NextResponse.json<IngestResult>(
            {
                id: created.id,
                status: 'created',
                hackathonId: created.hackathonId,
            },
            { status: 201 }
        );
    } catch (error) {
        const errorCode = (error as { code?: string })?.code;

        // PostgreSQL SQLSTATE 23505 = unique_violation.
        if (errorCode === '23505') {
            const existingAfterConflict = await findExistingAnnouncement(
                payload.messageId
            );

            if (existingAfterConflict) {
                ingestLog({
                    method,
                    outcome: 'duplicate',
                    httpStatus: 200,
                    durationMs: Date.now() - start,
                    messageId: payload.messageId,
                    channelId: payload.channelId,
                    guildId: payload.guildId,
                    hackathonId: existingAfterConflict.hackathonId,
                    attachmentCount,
                    isEdit,
                    note: 'unique_violation_replay',
                });
                return NextResponse.json<IngestResult>(
                    {
                        id: existingAfterConflict.id,
                        status: 'duplicate',
                        hackathonId: existingAfterConflict.hackathonId,
                    },
                    { status: 200 }
                );
            }
        }

        ingestLog({
            method,
            outcome: 'server_error',
            httpStatus: 500,
            durationMs: Date.now() - start,
            messageId: payload.messageId,
            channelId: payload.channelId,
            guildId: payload.guildId,
            attachmentCount,
            isEdit,
            errorName: error instanceof Error ? error.name : 'unknown',
        });
        console.error('Failed to ingest Discord announcement webhook', error);

        return NextResponse.json(
            { error: 'Failed to process announcement webhook' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    const start = Date.now();
    const method = 'DELETE';

    if (!verifyBearer(request)) {
        ingestLog({
            method,
            outcome: 'unauthorized',
            httpStatus: 401,
            durationMs: Date.now() - start,
        });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isIngestEnabled()) {
        ingestLog({
            method,
            outcome: 'disabled',
            httpStatus: 403,
            durationMs: Date.now() - start,
        });
        return NextResponse.json(
            { error: 'Discord ingest disabled' },
            { status: 403 }
        );
    }

    if (!consumeRateLimitToken()) {
        ingestLog({
            method,
            outcome: 'rate_limited',
            httpStatus: 429,
            durationMs: Date.now() - start,
        });
        return NextResponse.json(
            { error: 'Discord ingest rate limit exceeded' },
            { status: 429 }
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        ingestLog({
            method,
            outcome: 'invalid_json',
            httpStatus: 400,
            durationMs: Date.now() - start,
        });
        return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
        );
    }

    const parsed = deleteDiscordAnnouncementSchema.safeParse(body);
    if (!parsed.success) {
        ingestLog({
            method,
            outcome: 'validation_error',
            httpStatus: 400,
            durationMs: Date.now() - start,
        });
        return NextResponse.json(
            {
                error: 'Invalid request body',
                details: parsed.error.flatten(),
            },
            { status: 400 }
        );
    }

    const { messageId, channelId, guildId } = parsed.data;

    try {
        const row = await findAnnouncementForDelete(messageId);

        if (!row) {
            ingestLog({
                method,
                outcome: 'not_found',
                httpStatus: 200,
                durationMs: Date.now() - start,
                messageId,
                channelId,
                guildId,
            });
            return NextResponse.json<DeleteResult>(
                { status: 'not_found' },
                { status: 200 }
            );
        }

        if (row.isArchived) {
            ingestLog({
                method,
                outcome: 'duplicate',
                httpStatus: 200,
                durationMs: Date.now() - start,
                messageId,
                channelId,
                guildId,
                hackathonId: row.hackathonId,
                announcementId: row.id,
            });
            return NextResponse.json<DeleteResult>(
                {
                    id: row.id,
                    status: 'duplicate',
                    hackathonId: row.hackathonId,
                },
                { status: 200 }
            );
        }

        await databaseClient
            .update(announcements)
            .set({
                isArchived: true,
                updatedAt: new Date(),
            })
            .where(eq(announcements.id, row.id));

        ingestLog({
            method,
            outcome: 'archived',
            httpStatus: 200,
            durationMs: Date.now() - start,
            messageId,
            channelId,
            guildId,
            hackathonId: row.hackathonId,
            announcementId: row.id,
        });
        await publishAnnouncementEvent({
            kind: 'archived',
            hackathonId: row.hackathonId,
            announcementId: row.id,
        });
        return NextResponse.json<DeleteResult>(
            {
                id: row.id,
                status: 'archived',
                hackathonId: row.hackathonId,
            },
            { status: 200 }
        );
    } catch (error) {
        ingestLog({
            method,
            outcome: 'server_error',
            httpStatus: 500,
            durationMs: Date.now() - start,
            messageId,
            channelId,
            guildId,
            errorName: error instanceof Error ? error.name : 'unknown',
        });
        console.error(
            'Failed to archive Discord announcement (delete webhook)',
            error
        );

        return NextResponse.json(
            { error: 'Failed to process announcement delete webhook' },
            { status: 500 }
        );
    }
}
