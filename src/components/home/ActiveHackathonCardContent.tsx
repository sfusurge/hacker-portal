'use client';

import Image from 'next/image';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import {
    getMessage,
    getStatusBadge,
    type AppStatus,
    type ApplicationAction,
} from './activeHackathonCardHelpers';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export type CountdownParts = { d: number; h: number; m: number } | null;

export type ActiveHackathonCardContentProps = {
    format: (n: number) => string;
    open: CountdownParts;
    close: CountdownParts;
    applicationOpened: boolean;
    closedRegistration: boolean;
    applicationSubmitted: boolean;
    status: AppStatus;
    payloadName: string;
    bannerConfig: { websiteLabel: string; websiteHref: string };
    eventPageSlug: string;
    isAcceptedStatus: boolean;
    ticketQr?: string;
    applicationAction: ApplicationAction | null;
    onApplicationButtonClick: () => void;
};

export function ActiveHackathonCardContent({
    format,
    open,
    close,
    applicationOpened,
    closedRegistration,
    applicationSubmitted,
    status,
    payloadName,
    bannerConfig,
    eventPageSlug,
    isAcceptedStatus,
    ticketQr,
    applicationAction,
    onApplicationButtonClick,
}: ActiveHackathonCardContentProps) {
    const statusBadge = getStatusBadge(status);

    const acceptedWithActions =
        isAcceptedStatus &&
        applicationSubmitted &&
        applicationOpened &&
        !closedRegistration;

    /** "View ticket" (QR) available after registration closes for accepted hackers. */
    const showPrimaryAction =
        Boolean(applicationAction) &&
        (!closedRegistration ||
            (isAcceptedStatus &&
                Boolean(ticketQr) &&
                applicationSubmitted &&
                applicationOpened));

    /** mobile (under 768px), put "View ticket" (QR) above the event link so it is not missed. */
    const ticketViewFirstOnMobile =
        Boolean(ticketQr) &&
        isAcceptedStatus &&
        Boolean(applicationAction) &&
        showPrimaryAction;

    const actionButtonsRow = (wrapperClassName?: string) => (
        <div
            className={cn(
                'flex w-full flex-col gap-2 sm:flex-row',
                wrapperClassName
            )}
        >
            <Button
                size="cozy"
                variant="default"
                hierarchy="secondary"
                className={cn(
                    showPrimaryAction && applicationAction
                        ? 'w-full sm:w-1/2'
                        : 'w-full',
                    ticketViewFirstOnMobile && 'order-2 sm:order-1'
                )}
            >
                <Link href={`/${eventPageSlug}`}>
                    {bannerConfig.websiteLabel}
                </Link>
            </Button>

            {showPrimaryAction && applicationAction && (
                <Button
                    size="cozy"
                    variant={applicationAction.variant}
                    hierarchy="primary"
                    onClick={onApplicationButtonClick}
                    className={cn(
                        'w-full sm:w-1/2',
                        ticketViewFirstOnMobile && 'order-1 sm:order-2'
                    )}
                    trailingIconChild={applicationAction.icon ?? undefined}
                >
                    {applicationAction.label}
                </Button>
            )}
        </div>
    );

    return (
        <>
            <CardContent className="bg-neutral-850 flex flex-1 flex-col gap-6 px-6">
                {!applicationOpened ? (
                    <>
                        <div className="flex flex-col gap-4">
                            <div className="flex w-full overflow-hidden rounded-lg bg-neutral-800">
                                <div className="w-1/2 bg-neutral-700 px-4 py-2 text-center font-mono text-sm font-medium text-white">
                                    REGISTER IN
                                </div>

                                <div className="w-1/2 px-4 py-2 text-center text-sm text-white/80">
                                    {format(open?.d ?? 0)}d{' '}
                                    {format(open?.h ?? 0)}h{' '}
                                    {format(open?.m ?? 0)}m
                                </div>
                            </div>

                            <div className="border-t border-white/10" />

                            <p className="text-pretty text-white/60">
                                Applications opening soon! Checkout the{' '}
                                {payloadName} event page for more details.
                            </p>
                        </div>

                        <Button
                            size="cozy"
                            variant="default"
                            hierarchy="secondary"
                            className="w-full"
                        >
                            <a href={`/${eventPageSlug}`}>
                                {bannerConfig.websiteLabel}
                            </a>
                        </Button>
                    </>
                ) : (
                    <>
                        {closedRegistration ? (
                            <p className="text-base font-medium text-white">
                                Registrations closed!
                            </p>
                        ) : applicationSubmitted ? (
                            <div className="flex w-full items-center gap-1 py-2">
                                <p className="text-base font-medium text-white">
                                    Your{' '}
                                    <span className="hidden md:inline">
                                        Application
                                    </span>{' '}
                                    Status
                                </p>

                                <Chip
                                    className="ml-auto shrink-0"
                                    variant={statusBadge.variant}
                                >
                                    {statusBadge.label}
                                </Chip>
                            </div>
                        ) : (
                            <div className="flex w-full overflow-hidden rounded-lg bg-neutral-800">
                                <div className="w-1/2 bg-neutral-700 px-4 py-2 text-center text-sm font-medium text-white">
                                    CLOSES IN
                                </div>

                                <div className="w-1/2 px-4 py-2 text-center text-sm text-white/80">
                                    {format(close?.d ?? 0)}d{' '}
                                    {format(close?.h ?? 0)}h{' '}
                                    {format(close?.m ?? 0)}m
                                </div>
                            </div>
                        )}

                        <div className="border-t border-white/10" />

                        <p className="text-pretty text-white/60">
                            {closedRegistration
                                ? `${payloadName} is currently closed for applications. Visit the event page for the latest updates.`
                                : applicationSubmitted
                                  ? getMessage(status, payloadName)
                                  : 'Applications are open! Apply now to get your shot at participating in our creative design jam!'}
                        </p>

                        {isAcceptedStatus && ticketQr && (
                            <section className="hidden pt-1 md:block">
                                <div className="flex w-full rounded-xl bg-neutral-800">
                                    <div className="flex flex-1 items-center justify-center p-4">
                                        <div className="flex aspect-square h-44 w-44">
                                            <Image
                                                src={ticketQr}
                                                alt="Ticket QR Code"
                                                width={300}
                                                height={300}
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>

                                    <div className="large-dashes-vertical relative w-0 border-neutral-200">
                                        <div className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full bg-neutral-900"></div>
                                        <div className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full bg-neutral-900"></div>
                                    </div>

                                    <section className="flex w-8 flex-1" />
                                </div>
                            </section>
                        )}

                        {acceptedWithActions
                            ? actionButtonsRow('hidden md:flex')
                            : actionButtonsRow()}
                    </>
                )}
            </CardContent>
            {acceptedWithActions ? (
                <CardFooter className="bg-neutral-850 mt-auto flex flex-col gap-3 border-t border-neutral-600/30 px-6 py-4 md:hidden">
                    {actionButtonsRow()}
                </CardFooter>
            ) : null}
        </>
    );
}
