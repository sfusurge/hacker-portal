import { getCachedUserData } from '@/server/getCachedUserData';
import ProjectsClient from './ProjectsClient';

export default async function PublicProjectsPage() {
    const user = await getCachedUserData();
    return <ProjectsClient user={user} />;
}
