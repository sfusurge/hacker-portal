import { z } from 'zod';

export const sendEmailSchema = z.object({
    type: z.string(),
    user: z.object({
        id: z.number(),
        email: z.string().email(),
        name: z.string(),
    }),
});

export type EmailUser = {
    id: number;
    email: string;
    name: string;
};
