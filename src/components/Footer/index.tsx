'use client';

import { usePathname } from 'next/navigation';
import styles from './Footer.module.scss'

export default function Footer() {
	const pathname = usePathname();

	return (
		<footer className={`${styles.footer} ${pathname === '/' ? styles.isHome : ''}`}>
			<p className={styles.copyright}>© 2025 Kyohei Maeda</p>
		</footer>
	);
}