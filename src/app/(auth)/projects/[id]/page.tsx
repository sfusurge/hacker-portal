import ProjectPageClient from './ProjectPageClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
    const { id } = await params;
    return <ProjectPageClient id={id} />;
}
