import NotFound from '../../components/ui/NotFound';
import { Button } from '@/components/ui/button';

export default function Auth404Page() {
    return (
        <NotFound>
            <div>
                <Button size="cozy" variant="default" hierarchy="secondary">
                    Return to dashboard
                </Button>
            </div>
        </NotFound>
    );
}
