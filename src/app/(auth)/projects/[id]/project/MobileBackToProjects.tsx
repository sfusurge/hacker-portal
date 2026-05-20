import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function MobileBackToProjects() {
    return (
        <Link href="/projects" className="mb-8 block md:hidden">
            <Button variant="default" hierarchy="secondary" size="cozy">
                Return to Projects
            </Button>
        </Link>
    );
}
