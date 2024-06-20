import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { usersRouter } from "@/server";

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: "/api/users",
        req,
        router: usersRouter,
        createContext: () => ({})
    });

export { handler as GET, handler as POST };