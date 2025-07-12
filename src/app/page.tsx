'use client';

import styles from "./page.module.scss";

import MatterArea from '@/components/MatterArea';

export default function Home() {
  return (
    <>
      <section className={styles.section}>
        <div className={styles.textGroup}>
          <h1 className={styles.title}><span>K</span>YOHEI<br />MAEDA</h1>
          <p className={styles.text}>FRONT-END DEVELOPER.</p>
        </div>
        <MatterArea />
      </section>
    </>
  );
}
