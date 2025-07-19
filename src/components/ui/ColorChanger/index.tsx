'use client';

import { useEffect, useState } from 'react';

const colors = ['#41B883', '#83CD29', '#F0DB4F', '#2589CA', '#A259FF', '#CB6699', '#F16529'];

export default function ColorChanger() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // 初回レンダリング時にも色を設定
    document.documentElement.style.setProperty('--color-primary', colors[index]);

    const interval = setInterval(() => {
      setIndex(prev => {
        const nextIndex = (prev + 1) % colors.length;
        document.documentElement.style.setProperty('--color-primary', colors[nextIndex]);
        return nextIndex;
      });
    }, 3000); // 3秒ごとに色を切り替え

    return () => clearInterval(interval);
  }, [index]); // 依存配列に index を追加

  return null; // UI上は何も表示しない
}