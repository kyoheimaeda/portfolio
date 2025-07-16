import React from 'react';
import styles from "./index.module.scss";

type GlobalNavButtonProps = {
  onToggle: () => void;
  isOpen: boolean;
};

const GlobalNavButton: React.FC<GlobalNavButtonProps> = ({ onToggle, isOpen }) => {
  return (
		<button
			onClick={onToggle}
			className={`${styles.globalNavButton} ${isOpen ? styles.isOpen : ''}`}
		>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
		</button>
  );
};

export default GlobalNavButton;