import { createCallerFactory, publicProcedure, router } from './trpc';

import { applicationsRouter } from './routers/applicationsRouter';
import { checkInRouter } from './routers/checkInRouter';
import { eventsRouter } from './routers/eventsRouter';
import { hackathonsRouter } from './routers/hackathonsRouter';
import { sendEmailRouter } from './routers/sendEmailRouter';
import { usersRouter } from './routers/usersRouter';
import { teamsRouter } from './routers/teamsRouter';
import { filesRouter } from './routers/filesRouter';
import { emailTemplatesRouter } from './routers/emailTemplateRouter';
import { submissionsRouter } from './routers/submissionsRouter';

import { judgingRouter } from './routers/judgingRouter';
import { userVoteRouter } from '@/server/routers/userVoteRouter';
import { emailsRouter } from './routers/emailsRouter';

export const appRouter = router({
    health_check: publicProcedure.query(() => {
        return 'app router endpoint reached!';
    }),

    users: usersRouter,
    hackathons: hackathonsRouter,
    applications: applicationsRouter,
    emails: sendEmailRouter,
    emailTemplates: emailTemplatesRouter,
    subscribedEmails: emailsRouter,
    events: eventsRouter,
    checkIn: checkInRouter,

    judging: judgingRouter,
    userVote: userVoteRouter,

    teams: teamsRouter,
    files: filesRouter,
    submissions: submissionsRouter,
});

// For server side call in unit test
export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
