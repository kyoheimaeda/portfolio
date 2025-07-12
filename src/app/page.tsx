'use client';

import styles from "./page.module.scss";

import MatterArea from '@/components/MatterArea';

export default function Home() {
  return (
    <>
      <section className={styles.section}>
        <div className={styles.textGroup}>
          <h1 className={styles.title}>
            <div><strong>K</strong>YOHEI</div>
            <div>MAEDA</div></h1>
          <p className={styles.text}>FRONT-END <strong>DEVELOPER</strong></p>
        </div>
        <MatterArea />
      </section>
    </>
  );
}
