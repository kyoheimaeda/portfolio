'use client'

import React from 'react';
import Link from "next/link";
import styles from "./index.module.scss";

type GlobalNavContentProps = {
  isOpen: boolean;
  onClose: () => void;
};

const GlobalNavContent: React.FC<GlobalNavContentProps> = ({ isOpen, onClose }) => {
  return (
    <nav className={`${styles.nav} ${isOpen ? styles.isOpen : ''}`}>
			<ul className={styles.navList}>
				<li className={styles.navItem}>
					<Link href="/" onClick={onClose} data-text="HOME">HOME</Link>
				</li>
				<li className={styles.navItem}>
					<Link href="/about" onClick={onClose} data-text="ABOUT">ABOUT</Link>
				</li>
				<li className={styles.navItem}>
					<Link href="/gallery" onClick={onClose} data-text="GALLERY">GALLERY</Link>
				</li>
				<li className={styles.navItem}>
					<Link href="/contact" onClick={onClose} data-text="CONTACT">CONTACT</Link>
				</li>
			</ul>
		</nav>
  );
};

export default GlobalNavContent;