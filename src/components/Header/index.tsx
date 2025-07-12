'use client';

import { usePathname } from 'next/navigation';
import GlobalNav from '@/components/GlobalNav';
import styles from "./Header.module.scss";
import DarkModeToggle from '@/components/DarkModeToggle';

export default function Header() {
	const pathname = usePathname();
	return (
		<>
			<header className={`${styles.header} ${pathname === '/' ? styles.isHome : ''}`}>
			</header>
			<GlobalNav />
			<DarkModeToggle />
		</>
	);
}