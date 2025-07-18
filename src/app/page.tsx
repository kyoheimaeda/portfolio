'use client';

import styles from "./page.module.scss";

export default function Home() {
  return (
    <>
      <section className={styles.fv}>
        <div className={styles.fvTexts}>
          <h1 className={styles.fvTitle}>
            <p className={styles.fvTitleLine} data-text="KYOHEI"><strong>K</strong>YOHEI</p>
            <p className={styles.fvTitleLine} data-text="MAEDA">MAEDA</p>
          </h1>
          <p className={styles.fvText}>FRONT-END <strong data-text="DEVELOPER">DEVELOPER</strong></p>
        </div>
      </section>
    </>
  );
}
