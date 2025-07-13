'use client'
import { usePathname } from 'next/navigation';
import { useState } from 'react'
import Link from "next/link";
import styles from "./GlobalNav.module.scss";

export default function GlobalNav() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState<boolean>(false)
	const closeNav = () => setIsOpen(false)

	return (
		<>
			<button className={`${styles.navToggle} ${isOpen ? styles.isOpen : ''}  ${pathname === '/' ? styles.isHome : ''}`} onClick={() => setIsOpen(!isOpen)}>
				<span></span>
				<span></span>
				<span></span>
				<span></span>
			</button>
			
			<nav className={`${styles.nav} ${isOpen ? styles.isOpen : ''} ${pathname === '/' ? styles.isHome : ''}`}>
				<ul className={styles.navList}>
					<li className={styles.navItem}>
						<Link href="/" onClick={closeNav} data-text="HOME">HOME</Link>
					</li>
					<li className={styles.navItem}>
						<Link href="/about" onClick={closeNav} data-text="ABOUT">ABOUT</Link>
					</li>
					<li className={styles.navItem}>
						<Link href="/projects" onClick={closeNav} data-text="PROJECTS">PROJECTS</Link>
					</li>
					<li className={styles.navItem}>
						<Link href="/contact" onClick={closeNav} data-text="CONTACT">CONTACT</Link>
					</li>
				</ul>
			</nav>
		</>
	);
}