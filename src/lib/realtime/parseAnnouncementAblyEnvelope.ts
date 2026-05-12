import { z } from 'zod';

const visibilitySchema = z.object({
    mappingJoined: z.boolean(),
    mappingEventLocationKey: z.string().nullable(),
});

const archivedSchema = z.object({
    kind: z.literal('archived'),
    hackathonId: z.number(),
    announcementId: z.number(),
});

const createdUpdatedSchema = z.object({
    kind: z.enum(['created', 'updated']),
    hackathonId: z.number(),
    announcementId: z.number(),
    announcement: z.record(z.unknown()).optional(),
    visibility: visibilitySchema.optional(),
});

export type ParsedAnnouncementAblyEnvelope =
    | z.infer<typeof archivedSchema>
    | z.infer<typeof createdUpdatedSchema>;

export function parseAnnouncementAblyEnvelope(
    data: unknown
): ParsedAnnouncementAblyEnvelope | null {
    if (!data || typeof data !== 'object') return null;
    const o = data as Record<string, unknown>;
    const kind = o.kind;

    if (kind === 'archived') {
        const r = archivedSchema.safeParse(data);
        return r.success ? r.data : null;
    }

    if (kind === 'created' || kind === 'updated') {
        const r = createdUpdatedSchema.safeParse(data);
        return r.success ? r.data : null;
    }

    return null;
}
