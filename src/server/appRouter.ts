import { createCallerFactory, publicProcedure, router } from './trpc';

import { applicationsRouter } from './routers/applicationsRouter';
import { checkInRouter } from './routers/checkInRouter';
import { eventsRouter } from './routers/eventsRouter';
import { hackathonsRouter } from './routers/hackathonsRouter';
import { sendEmailRouter } from './routers/sendEmailRouter';
import { usersRouter } from './routers/usersRouter';
import { filesRouter } from './routers/filesRouter';

export const appRouter = router({
    health_check: publicProcedure.query(() => {
        return 'app router endpoint reached!';
    }),

    users: usersRouter,
    hackathons: hackathonsRouter,
    applications: applicationsRouter,
    emails: sendEmailRouter,
    events: eventsRouter,
    checkIn: checkInRouter,
    files: filesRouter,
});

// For server side call in unit test
export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
