import { z } from "zod";

export const sendEmailSchema = z.object({
    user: z.object({
        id: z.string(),
        email: z.string().email(),
        first_name: z.string(),
        last_name: z.string()
    })
});

export type EmailUser = {
    id: string,
    email: string,
    password: string,
    first_name: string,
    last_name: string
};