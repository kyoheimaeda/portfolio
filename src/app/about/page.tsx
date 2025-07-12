import type { Metadata } from 'next';
import styles from "./page.module.scss";


export const metadata: Metadata = {
  title: 'About',
  description: 'Aboutページの説明文',
};

export default function About() {
  return (
    <>
      <section className={styles.section}>
        <h1 className={styles.title}>About</h1>
        <p className={styles.text}>This is the about page.</p>
      </section>
    </>
  );
}
