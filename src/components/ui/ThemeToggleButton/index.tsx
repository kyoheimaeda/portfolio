'use client';

import { useAtom } from 'jotai';
import { ThemeAtom } from '@/state/atoms/ThemeAtom';
import { MdContrast } from "react-icons/md";
import styles from "./index.module.scss";


export default function ThemeToggleButton() {
  const [theme, setTheme] = useAtom(ThemeAtom);

  return (
    <button
      className={styles.darkModeToggle}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle Dark Mode"
    >
      <MdContrast className={`${styles.icon} ${theme === 'dark' ? styles.isDark : styles.isLight}`} />
    </button>
  );
}
