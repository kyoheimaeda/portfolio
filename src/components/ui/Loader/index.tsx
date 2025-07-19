'use client';

import { motion } from 'motion/react';
import styles from './index.module.scss';

export default function Loader() {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.loaderWrapper}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={styles.loaderDot}
            animate={{
              scale: [0, 1],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}
