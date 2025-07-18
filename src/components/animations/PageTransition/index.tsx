'use client';

import { motion, AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import styles from './index.module.scss';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstRender = useRef(true);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setShowOverlay(true);
    const timeout = setTimeout(() => setShowOverlay(false), 1000); // オーバーレイ表示時間
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {showOverlay && (
          <motion.div key="overlayWrap" className={styles.overlayWrap}>
            <motion.div key="overlay" className={styles.overlay} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.8, delay: 0, ease: 'circInOut' }} />
            <motion.div key="overlay2" className={styles.overlay2} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.8, delay: 0.1, ease: 'circInOut' }} />
            <motion.div key="overlay3" className={styles.overlay3} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.8, delay: 0.2, ease: 'circInOut' }} />
            <motion.p className={styles.overlayText} data-text="KYOHEI MAEDA" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: 'easeInOut' }}>KYOHEI MAEDA</motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: showOverlay ? 0 : 1 }}
        transition={{ duration: 0.3, delay: showOverlay ? 0.6 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}