import type { Metadata } from 'next';
import styles from "./page.module.scss";
import PageWrap from '@/components/layout/PageWrap';

export const metadata: Metadata = {
  title: 'About',
  description: 'Aboutページの説明文',
};

export default function About() {
  return (
    <PageWrap title="ABOUT">
      <section className={`${styles.section}`}>
        <p className={styles.text}>This is the about page.</p>
      </section>
    </PageWrap>
  );
}
