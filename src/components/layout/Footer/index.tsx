'use client';

import styles from './index.module.scss'

export default function Footer() {
	return (
		<footer className={`${styles.footer}`}>
			<p className={styles.copyright}>© 2025 Kyohei Maeda</p>
		</footer>
	);
}