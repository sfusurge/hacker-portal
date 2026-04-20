import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { databaseClient } from '@/db/client';
import {
    announcementAttachments,
    announcementChannelMappings,
    announcements,
    ingestDiscordAnnouncementSchema,
} from '@/db/schema/announcements';

type IngestStatus = 'created' | 'duplicate' | 'updated';

type IngestResult = {
    id: number;
    status: IngestStatus;
    hackathonId: number;
};

type IngestPayload = z.infer<typeof ingestDiscordAnnouncementSchema>;

type ExistingAnnouncement = {
    id: number;
    hackathonId: number;
    lastEditedAt: Date | null;
};

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

function buildAttachmentRows(announcementId: number, payload: IngestPayload) {
    return payload.attachments.map((attachment, index) => ({
        announcementId,
        sourceUrl: attachment.url,
        filename: attachment.filename ?? null,
        contentType: attachment.contentType ?? null,
        sizeBytes: attachment.sizeBytes ?? null,
        width: attachment.width ?? null,
        height: attachment.height ?? null,
        position: index,
    }));
}

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.DISCORD_INGEST_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: 'Invalid JSON payload' },
            { status: 400 }
        );
    }

    const parsed = ingestDiscordAnnouncementSchema.safeParse(body);
    if (!parsed.success) {
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

    try {
        const existing = await findExistingAnnouncement(payload.messageId);

        if (existing) {
            const isDuplicate =
                !editedAt ||
                (existing.lastEditedAt &&
                    editedAt.getTime() <= existing.lastEditedAt.getTime());

            if (isDuplicate) {
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
                    await tx
                        .insert(announcementAttachments)
                        .values(buildAttachmentRows(existing.id, payload));
                }
            });

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
                    rawPayload: payload.rawPayload ?? null,
                    sourceTimestamp: new Date(payload.timestamp),
                    lastEditedAt: editedAt,
                })
                .returning({
                    id: announcements.id,
                    hackathonId: announcements.hackathonId,
                });

            if (payload.attachments.length > 0) {
                await tx
                    .insert(announcementAttachments)
                    .values(buildAttachmentRows(row.id, payload));
            }

            return row;
        });

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

        console.error('Failed to ingest Discord announcement webhook', error);

        return NextResponse.json(
            { error: 'Failed to process announcement webhook' },
            { status: 500 }
        );
    }
}
