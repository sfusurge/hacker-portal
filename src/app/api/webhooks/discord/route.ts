import { NextRequest, NextResponse } from 'next/server';
import { and, eq, or } from 'drizzle-orm';
import { databaseClient } from '@/db/client';
import {
    announcementChannelMappings,
    announcements,
    ingestDiscordAnnouncementSchema,
} from '@/db/schema/announcements';

type IngestResult = {
    id: number;
    status: 'created' | 'duplicate';
    hackathonId: number;
};

async function findExistingAnnouncement(
    idempotencyKey: string,
    sourceMessageId: string
): Promise<{ id: number; hackathonId: number } | undefined> {
    const [existing] = await databaseClient
        .select({
            id: announcements.id,
            hackathonId: announcements.hackathonId,
        })
        .from(announcements)
        .where(
            or(
                eq(announcements.idempotencyKey, idempotencyKey),
                and(
                    eq(announcements.source, 'discord'),
                    eq(announcements.sourceMessageId, sourceMessageId)
                )
            )
        )
        .limit(1);

    return existing;
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

    try {
        const existing = await findExistingAnnouncement(
            idempotencyKey,
            payload.messageId
        );

        if (existing) {
            const duplicateResponse: IngestResult = {
                id: existing.id,
                status: 'duplicate',
                hackathonId: existing.hackathonId,
            };

            return NextResponse.json(duplicateResponse, { status: 200 });
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

        const [created] = await databaseClient
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
            })
            .returning({
                id: announcements.id,
                hackathonId: announcements.hackathonId,
            });

        const createdResponse: IngestResult = {
            id: created.id,
            status: 'created',
            hackathonId: created.hackathonId,
        };

        return NextResponse.json(createdResponse, { status: 201 });
    } catch (error) {
        const errorCode = (error as { code?: string })?.code;

        // PostgreSQL SQLSTATE 23505 = unique_violation.
        if (errorCode === '23505') {
            const existingAfterConflict = await findExistingAnnouncement(
                idempotencyKey,
                payload.messageId
            );

            if (existingAfterConflict) {
                const duplicateResponse: IngestResult = {
                    id: existingAfterConflict.id,
                    status: 'duplicate',
                    hackathonId: existingAfterConflict.hackathonId,
                };

                return NextResponse.json(duplicateResponse, { status: 200 });
            }
        }

        console.error('Failed to ingest Discord announcement webhook', error);

        return NextResponse.json(
            { error: 'Failed to process announcement webhook' },
            { status: 500 }
        );
    }
}
