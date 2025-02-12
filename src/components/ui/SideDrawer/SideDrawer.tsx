import { ReactNode, useEffect } from 'react';

import style from './SideDrawer.module.css';
import { motion, AnimatePresence } from 'motion/react';
import { PrimitiveAtom, useAtom } from 'jotai';
import { Button } from '../button';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

export function SideDrawer({
    visibleAtom,
    children,
}: {
    visibleAtom: PrimitiveAtom<boolean>;
    children?: ReactNode;
}) {
    const [visible, setVisible] = useAtom(visibleAtom);

    useEffect(() => {
        function onBack() {}

        if (visible) {
            window.addEventListener('popstate', onBack);
            window.history.pushState(null, '');
        }

        return () => {
            window.removeEventListener('popstate', onBack);
        };
    }, [visible]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                        transition: {
                            duration: 0.4,
                            ease: 'easeOut',
                        },
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    className={style.backdrop}
                    onClick={() => {
                        setVisible(false);
                        window.history.back();
                    }}
                />
            )}
            {visible && (
                <motion.div
                    initial={{
                        x: '0',
                    }}
                    animate={{
                        x: '-100%',
                        transition: {
                            duration: 0.4,
                            ease: 'easeOut',
                        },
                    }}
                    exit={{
                        x: '0',
                    }}
                    className={style.drawerContainer}
                >
                    <Button
                        onClick={() => {
                            setVisible(false);
                            window.history.back();
                        }}
                    >
                        <ChevronRightIcon style={{ width: '20px' }} />
                        <span>Back</span>
                    </Button>
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
