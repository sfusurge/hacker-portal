import { ReactNode, useEffect } from 'react';

import style from './SideDrawer.module.css';
import { motion, AnimatePresence } from 'motion/react';
import { PrimitiveAtom, useAtom } from 'jotai';

export function SideDrawer({
    visibleAtom,
    children,
}: {
    visibleAtom: PrimitiveAtom<boolean>;
    children?: ReactNode;
}) {
    const [visible, setVisible] = useAtom(visibleAtom);

    useEffect(() => {
        function onBack() {
            setVisible(false);
        }

        if (visible) {
            window.addEventListener('popstate', onBack);
            window.history.pushState(null, '');
        }

        return () => {
            window.removeEventListener('popstate', onBack);
        };
    }, [visible]);

    return (
        <>
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 0.6,
                            transition: {
                                duration: 0.35,
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
            </AnimatePresence>
            <AnimatePresence>
                {visible && (
                    <motion.div
                        initial={{
                            x: '0',
                        }}
                        animate={{
                            x: '-100%',
                            transition: {
                                duration: 0.35,
                            },
                        }}
                        exit={{
                            x: '0',
                        }}
                        className={style.drawerContainer}
                    >
                        <div style={{ minWidth: '250px' }}>{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
