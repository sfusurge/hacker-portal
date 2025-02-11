import { createCallerFactory, publicProcedure, router } from './trpc';

import { usersRouter } from './routers/usersRouter';
import { hackathonsRouter } from './routers/hackathonsRouter';
import { applicationsRouter } from './routers/applicationsRouter';
import { sendEmailRouter } from './routers/sendEmailRouter';
import { checkInRouter } from '@/server/routers/checkInRouter';
import { eventsRouter } from '@/server/routers/eventsRouter';

export const appRouter = router({
    health_check: publicProcedure.query(() => {
        return 'app router endpoint reached!';
    }),

    users: usersRouter,
    hackathons: hackathonsRouter,

    applications: applicationsRouter,
    emails: sendEmailRouter,
    checkin: checkInRouter,
    events: eventsRouter,
});

// For server side call in unit test
export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
