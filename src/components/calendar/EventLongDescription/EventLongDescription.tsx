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
import { motion, AnimatePresence } from 'motion/react';

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
            <motion.div
                initial={{
                    opacity: 0.4,
                }}
                animate={{
                    opacity: 0.6,
                    transition: {
                        ease: 'easeOut',
                        duration: 0.2,
                    },
                }}
                exit={{ opacity: 0 }}
                className={style.backdrop}
                onClick={closeModal}
            />
            <motion.div
                initial={{
                    x: '-50%',
                    y: 'calc(-50% + 20px)',
                    opacity: 0.8,
                }}
                animate={{
                    x: '-50%',
                    y: '-50%',
                    opacity: 1,
                    transition: {
                        ease: 'easeOut',
                        duration: 0.2,
                    },
                }}
                exit={{
                    opacity: 0,
                }}
                className={style.longDescriptionContainer}
            >
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
            </motion.div>
        </>
    );
}
