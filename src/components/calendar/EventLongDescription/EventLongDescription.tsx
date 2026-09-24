'use client';

import type { ComponentType, ReactNode, SVGProps } from 'react';
import { useEffect } from 'react';
import { useRemarkSync } from 'react-remark';
import { motion } from 'motion/react';
import {
    CalendarDaysIcon,
    LinkIcon,
    MapPinIcon,
    UserGroupIcon,
    XMarkIcon,
} from '@heroicons/react/24/solid';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardHeaderColumn,
    CardHeaderDescription,
    CardHeaderTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EVENT_DISCORD_URL } from '@/lib/eventDiscord';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import style from './EventLongDescription.module.css';
import { InternalCalendarEventType } from '../MonthCalendarShared';

type LongDescriptionModalProps = {
    event: InternalCalendarEventType;
    onClose: () => void;
    isAdmin?: boolean;
    onAddToSchedule?: () => void | Promise<void>;
    addToScheduleDisabled?: boolean;
    onEditEvent?: () => void;
    onEventDeleted?: () => void | Promise<void>;
};

type EventDetailRowData = {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    label: string;
    value: ReactNode;
};

function MarkdownDisplay({ content }: { content: string }) {
    const markdownContent = useRemarkSync(content);

    return <div className={style.md}>{markdownContent}</div>;
}

export function LongDescriptionModal({
    event,
    onClose,
    isAdmin = false,
    onAddToSchedule,
    addToScheduleDisabled = false,
    onEditEvent,
    onEventDeleted,
}: LongDescriptionModalProps) {
    const rsvpCount = trpc.events.getEventRsvpCount.useQuery(
        { eventId: event.id },
        { enabled: isAdmin }
    );
    const checkIns = trpc.events.getEventCheckInCount.useQuery(
        { eventId: event.id },
        { enabled: Boolean(isAdmin && onEventDeleted) }
    );
    const deleteEvent = trpc.events.deleteEvent.useMutation();

    const hasCheckIns = (checkIns.data?.checkInCount ?? 0) > 0;
    const canDelete = Boolean(isAdmin && onEventDeleted && !hasCheckIns);
    const showFooter = Boolean(onAddToSchedule || isAdmin);
    const discordLink = (
        <a
            className={style.detailLink}
            href={EVENT_DISCORD_URL}
            rel="noreferrer"
            target="_blank"
        >
            Join on Discord
        </a>
    );
    const locationRow = event.location
        ? {
              icon: MapPinIcon,
              label: 'Location',
              value: event.location,
          }
        : undefined;
    const detailRows = [
        ...(isAdmin
            ? [
                  {
                      icon: LinkIcon,
                      label: 'Link',
                      value: discordLink,
                  },
                  locationRow,
                  {
                      icon: UserGroupIcon,
                      label: 'Added to schedule',
                      value: rsvpCount.isLoading
                          ? '...'
                          : (rsvpCount.data?.rsvpCount ?? 0),
                  },
              ]
            : [
                  locationRow,
                  {
                      icon: LinkIcon,
                      label: 'Link',
                      value: discordLink,
                  },
              ]),
    ].filter(Boolean) as EventDetailRowData[];

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    async function handleDeleteEvent() {
        if (!canDelete || deleteEvent.isPending) {
            return;
        }

        await deleteEvent.mutateAsync({ eventId: event.id });
        await onEventDeleted?.();
        onClose();
    }

    return (
        <>
            <motion.div
                className={style.backdrop}
                initial={{ opacity: 0 }}
                animate={{
                    opacity: 1,
                    transition: { duration: 0.18, ease: 'easeOut' },
                }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div
                aria-labelledby={`event-details-title-${event.id}`}
                aria-modal="true"
                className={style.modalPositioner}
                initial={{
                    opacity: 0,
                    scale: 0.96,
                    x: '-50%',
                    y: 'calc(-50% + 16px)',
                }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    x: '-50%',
                    y: '-50%',
                    transition: { duration: 0.18, ease: 'easeOut' },
                }}
                exit={{
                    opacity: 0,
                    scale: 0.98,
                    x: '-50%',
                    y: 'calc(-50% + 10px)',
                }}
                role="dialog"
            >
                <Card className={style.modalCard}>
                    <CardHeader className={style.header}>
                        <CardHeaderColumn className={style.headerColumn}>
                            <CardHeaderTitle
                                className={style.title}
                                id={`event-details-title-${event.id}`}
                            >
                                {event.title}
                            </CardHeaderTitle>
                            <CardHeaderDescription className={style.timeLabel}>
                                <CalendarDaysIcon className={style.metaIcon} />
                                {getEventDetailsTimeLabel(event)}
                            </CardHeaderDescription>
                        </CardHeaderColumn>

                        <button
                            aria-label="Close event details"
                            className={style.closeButton}
                            onClick={onClose}
                            type="button"
                        >
                            <XMarkIcon className={style.closeIcon} />
                        </button>
                    </CardHeader>

                    <CardContent className={style.content}>
                        <EventDetailsContent event={event} />

                        <div className={style.detailRows}>
                            {detailRows.map(({ label, ...row }) => (
                                <EventDetailRow
                                    key={label}
                                    label={label}
                                    {...row}
                                />
                            ))}
                        </div>
                    </CardContent>

                    {showFooter && (
                        <CardFooter className={style.footer}>
                            {isAdmin ? (
                                <>
                                    <Button
                                        className={style.footerButton}
                                        hierarchy="primary"
                                        onClick={onEditEvent}
                                        size="compact"
                                        type="button"
                                        variant="default"
                                    >
                                        Edit event
                                    </Button>
                                    <Button
                                        className={cn(
                                            'ml-auto',
                                            style.footerButton
                                        )}
                                        disabled={
                                            !canDelete ||
                                            checkIns.isLoading ||
                                            deleteEvent.isPending
                                        }
                                        hierarchy="primary"
                                        onClick={handleDeleteEvent}
                                        size="compact"
                                        type="button"
                                        variant="danger"
                                    >
                                        Delete event
                                    </Button>
                                </>
                            ) : (
                                onAddToSchedule && (
                                    <Button
                                        className={style.footerButton}
                                        disabled={addToScheduleDisabled}
                                        hierarchy="primary"
                                        onClick={onAddToSchedule}
                                        size="compact"
                                        type="button"
                                        variant="brand"
                                    >
                                        Add to schedule
                                    </Button>
                                )
                            )}
                        </CardFooter>
                    )}
                </Card>
            </motion.div>
        </>
    );
}

export function EventLongDescriptionContent({
    event,
    className,
}: {
    event: InternalCalendarEventType;
    className?: string;
}) {
    return (
        <div className={cn(style.standaloneContent, className)}>
            <EventDetailsContent event={event} />
        </div>
    );
}

function EventDetailsContent({ event }: { event: InternalCalendarEventType }) {
    const longDescription = trpc.events.getEventLongDescription.useQuery({
        eventId: event.id,
    });
    const shortDescription = event.description?.trim();
    const longDescriptionText =
        longDescription.data?.longDescription?.trim() ?? '';
    const showShortDescription = Boolean(
        shortDescription && shortDescription !== longDescriptionText
    );
    const hasDescription = showShortDescription || longDescriptionText;

    return (
        <>
            {event.imageUrl && (
                <img alt="" className={style.eventImage} src={event.imageUrl} />
            )}

            {hasDescription && (
                <div className={style.descriptionScrollArea}>
                    {showShortDescription && (
                        <p className={style.shortDescription}>
                            {shortDescription}
                        </p>
                    )}
                    {longDescriptionText && (
                        <MarkdownDisplay content={longDescriptionText} />
                    )}
                </div>
            )}
        </>
    );
}

function EventDetailRow({ icon: Icon, label, value }: EventDetailRowData) {
    return (
        <div className={style.detailRow}>
            <span className={style.detailLabel}>
                <Icon className={style.detailIcon} />
                {label}
            </span>
            <span className={style.detailValue}>{value}</span>
        </div>
    );
}

function getEventDetailsTimeLabel(event: InternalCalendarEventType) {
    const startDate = event.startTime.format('MMM. D');
    const endDate = event.endTime.format('MMM. D');
    const dateLabel = event.startTime.isSame(event.endTime, 'day')
        ? startDate
        : `${startDate} - ${endDate}`;

    return `${dateLabel} · ${event.startTime.format('h:mm A')}-${event.endTime.format('h:mm A')}`;
}
