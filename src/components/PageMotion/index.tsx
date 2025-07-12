// components/PageTransitionWrapper/index.tsx
'use client';

import { AnimatePresence } from 'motion/react';
import * as motion from 'motion/react-client';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import styles from './PageMotion.module.scss';

export default function PageMotion({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 初回マウントかどうかを判定
  const isFirstRender = useRef(true);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    // 初回レンダーならスキップ
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // それ以降のページ遷移時のみアニメーション
    setShowOverlay(true);
    const timeout = setTimeout(() => setShowOverlay(false), 1000);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {/* 黒背景スライド */}
      <AnimatePresence mode="wait">
        {showOverlay && (
          <motion.div
            key="overlay"
            className={styles.overlay}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* コンテンツ本体 */}
      <motion.main
        key={pathname}
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: showOverlay ? 0 : 1 }}
        transition={{ duration: 0.3, delay: showOverlay ? 0.6 : 0 }}
      >
        {children}
      </motion.main>
    </>
  );
}
