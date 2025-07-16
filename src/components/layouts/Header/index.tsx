'use client';

import { usePathname } from 'next/navigation';
import GlobalNavButton from '@/components/layouts/GlobalNavButton';
import GlobalNavContent from '@/components/layouts/GlobalNavContent';
import ThemeToggleButton from '@/components/uissss/ThemeToggleButton';
import styles from "./index.module.scss";
import React, { useState } from 'react';

export default function Header() {
	const [isNavOpen, setIsNavOpen] = useState(false);
	
	const toggleNav = () => {
		setIsNavOpen(!isNavOpen);
	}	;
	
	const pathname = usePathname();
	
	return (
		<>
			<header className={`${styles.header} ${pathname === '/' ? styles.isHome : ''}`}>
				<div className={styles.headerActions}>
					<GlobalNavButton onToggle={toggleNav} isOpen={isNavOpen} />
					<ThemeToggleButton />
				</div>
			</header>
			<GlobalNavContent isOpen={isNavOpen} onClose={toggleNav} />
		</>
	);
}