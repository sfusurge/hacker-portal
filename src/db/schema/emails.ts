import { z } from 'zod';

export const sendEmailSchema = z.object({
  user: z.object({
    id: z.number(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
  }),
});

export type EmailUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
};
