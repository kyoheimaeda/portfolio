'use client';

import { useEffect, useRef } from 'react';
import styles from './ParallaxArea.module.scss';
import { SiReact } from '@icons-pack/react-simple-icons';

export default function ParallaxArea() {
  const areaRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const area = areaRef.current;
    const items = itemRefs.current;
    const parallaxVal = 10;

    const handleMouseMove = (e: MouseEvent) => {
      const xCenter = window.innerWidth / 2;
      const yCenter = window.innerHeight / 2;

      const x = (xCenter - e.pageX) / parallaxVal;
      const y = (yCenter - e.pageY) / parallaxVal;

      items.forEach((item) => {
        item.style.transform = `translate(${-x}px, ${-y}px)`;
      });
    };

    if (area) {
      area.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      area?.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={styles.parallaxArea} ref={areaRef}>
      {[0, 1, 2, 3].map((_, index) => (
        <div
          key={index}
          className={`${styles.parallaxItem}`}
          ref={(el) => {
            if (el) itemRefs.current[index] = el;
          }}
        >
          <SiReact />
        </div>
      ))}
    </div>
  );
}
