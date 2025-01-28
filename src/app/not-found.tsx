import Link from 'next/link';
import { Button } from '@/components/ui/button';

import NotFound from './components/NotFound';

export default function NotFoundPage() {
    return (
        <div className="grid h-screen w-screen">
            <div className="m-6 md:m-5 md:bg-neutral-925 md:rounded-2xl md:border md:border-neutral-600/30">
                <NotFound>
                    <div>
                        <Button
                            size="cozy"
                            variant="brand"
                            hierarchy="primary"
                            className="text-white bg-brand-600 hover:bg-brand-700"
                        >
                            <a href="/login">Return to home</a>
                        </Button>
                    </div>
                </NotFound>
            </div>
        </div>
    );
}
