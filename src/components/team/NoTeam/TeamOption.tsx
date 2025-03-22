'use client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Drawer, DrawerTrigger } from '@/components/ui/drawer';
import JoinTeamForm from './JoinTeamForm';
import CreateTeamForm from './CreateTeamForm';
import { FormSeparator } from '@/components/ui/form-separator';
import { useEffect, useState } from 'react';

export default function JoinTeam({ hackathonId }: { hackathonId: number }) {
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsDesktop(window.innerWidth >= 768);

            const handleResize = () => {
                setIsDesktop(window.innerWidth >= 768);
            };

            window.addEventListener('resize', handleResize);

            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    const Container = isDesktop ? Dialog : Drawer;
    const Trigger = isDesktop ? DialogTrigger : DrawerTrigger;

    return (
        <div className="grid w-full gap-3 lg:grid-cols-2">
            <Container>
                <Trigger asChild>
                    <Button
                        size="cozy"
                        variant="default"
                        hierarchy="secondary"
                        className="w-full px-5 text-sm"
                    >
                        Join existing team
                    </Button>
                </Trigger>
                <JoinTeamForm isDesktop={isDesktop} />
            </Container>

            <div className="lg:hidden">
                <FormSeparator separatorText="OR" />
            </div>

            <Container>
                <Trigger asChild>
                    <Button
                        size="cozy"
                        variant="default"
                        hierarchy="secondary"
                        className="w-full px-5 text-sm"
                    >
                        Create new team
                    </Button>
                </Trigger>
                <CreateTeamForm
                    hackathonId={hackathonId}
                    isDesktop={isDesktop}
                />
            </Container>
        </div>
    );
}
