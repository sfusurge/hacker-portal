import { getUserData } from '@/server/routers/usersRouter';
import ProjectsClient from './ProjectsClient';

export default async function PublicProjectsPage() {
    const user = await getUserData();
    return <ProjectsClient user={user} />;
}
