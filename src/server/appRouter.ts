import { createCallerFactory, publicProcedure, router } from './trpc';

import { applicationsRouter } from './routers/applicationsRouter';
import { checkInRouter } from './routers/checkInRouter';
import { nfcRouter } from './routers/nfcRouter';
import { eventsRouter } from './routers/eventsRouter';
import { hackathonsRouter } from './routers/hackathonsRouter';
import { sendEmailRouter } from './routers/sendEmailRouter';
import { usersRouter } from './routers/usersRouter';
import { teamsRouter } from './routers/teamsRouter';
import { filesRouter } from './routers/filesRouter';
import { emailTemplatesRouter } from './routers/emailTemplateRouter';
import { emailTemplateStylingRouter } from './routers/emailTemplateStylingRouter';
import { submissionsRouter } from './routers/submissionsRouter';
import { companyRouter } from './routers/companyRouter';
import { announcementsRouter } from './routers/announcementsRouter';

import { judgingRouter } from './routers/judgingRouter';
import { userVoteRouter } from '@/server/routers/userVoteRouter';
import { emailsRouter } from './routers/emailsRouter';
import { emailQueueRouter } from './routers/emailQueueRouter';

export const appRouter = router({
    health_check: publicProcedure.query(() => {
        return 'app router endpoint reached!';
    }),

    users: usersRouter,
    hackathons: hackathonsRouter,
    applications: applicationsRouter,
    emails: sendEmailRouter,
    emailTemplates: emailTemplatesRouter,
    emailTemplateStyling: emailTemplateStylingRouter,
    subscribedEmails: emailsRouter,
    events: eventsRouter,
    checkIn: checkInRouter,
    nfc: nfcRouter,
    company: companyRouter,

    judging: judgingRouter,
    userVote: userVoteRouter,

    teams: teamsRouter,
    files: filesRouter,
    submissions: submissionsRouter,
    announcements: announcementsRouter,

    emailQueue: emailQueueRouter,
});

// For server side call in unit test
export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
