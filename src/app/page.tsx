'use client';

import styles from "./page.module.scss";

// import MatterArea from '@/components/MatterArea';
// import ParallaxArea from '@/components/ParallaxArea';

export default function Home() {
  return (
    <>
      <section className={styles.fv}>
        {/* <ParallaxArea /> */}
        <div className={styles.fvTexts}>
          <h1 className={styles.fvTitle}>
            <p data-text="KYOHEI"><strong>K</strong>YOHEI</p>
            <p data-text="MAEDA">MAEDA</p>
          </h1>
          <p className={styles.fvText}>FRONT-END <strong data-text="DEVELOPER">DEVELOPER</strong></p>
        </div>
      </section>
      {/* <section className={styles.about}>
        <MatterArea />
      </section> */}
    </>
  );
}
