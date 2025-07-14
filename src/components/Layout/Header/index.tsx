'use client';

import { usePathname } from 'next/navigation';
import GlobalNav from '@/components/Layout/GlobalNav';
import styles from "./Header.module.scss";
import ThemeToggle from '@/components/Ui/ThemeToggle';

export default function Header() {
	const pathname = usePathname();
	return (
		<>
			<header className={`${styles.header} ${pathname === '/' ? styles.isHome : ''}`}>
			</header>
			<GlobalNav />
			<ThemeToggle />
		</>
	);
}