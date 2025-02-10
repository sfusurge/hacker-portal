import style from './EventLongDescription.module.css';
import { useRemarkSync } from 'react-remark';
import {
    getDebugLongDescription,
    getEventDurationString,
    InternalCalendarEventType,
} from '../MonthCalendarShared';
import { ClockIcon, MapPinIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { trpc } from '@/trpc/client';
import { useEffect } from 'react';

function MarkdownDisplay({ content }: { content: string }) {
    const markdownContent = useRemarkSync(content);
    //  style html within this container
    return <div className={style.md}>{markdownContent}</div>;
}

export function LongDescriptionModal({
    event,
    onClose,
}: {
    event: InternalCalendarEventType;
    onClose: () => void;
}) {
    // const longDescription = trpc.events.getEventLongDescription.useQuery({
    //     eventId: event.id,
    // });
    let longDescription = {
        data: { longDescription: getDebugLongDescription('') },
    };

    function closeModal() {
        onClose();
        window.history.back();
    }

    useEffect(() => {
        // "shallow routing", https://github.com/vercel/next.js/pull/58335
        window.history.pushState(null, '');
        window.addEventListener('popstate', () => {
            onClose();
        });
    }, []);

    return (
        <>
            <div className={style.backdrop} onClick={closeModal} />

            <div className={style.longDescriptionContainer}>
                <div className={style.contentHolder}>
                    <h1 className={style.title}>
                        {event.title}

                        <button onClick={closeModal}>
                            <XMarkIcon style={{ width: '24px' }} />
                        </button>
                    </h1>

                    <span className={style.line}>
                        <ClockIcon style={{ width: '24px' }} />
                        {getEventDurationString(event)}
                    </span>

                    {event.location && (
                        <span className={style.line}>
                            <MapPinIcon style={{ width: '24px' }} />
                            {event.location}
                        </span>
                    )}

                    <MarkdownDisplay
                        content={longDescription.data?.longDescription ?? 'N/A'}
                    />
                </div>
            </div>
        </>
    );
}
