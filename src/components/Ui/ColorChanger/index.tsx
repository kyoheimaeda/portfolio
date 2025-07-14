// app/components/ColorChanger.tsx
'use client';

import { useEffect, useState } from 'react';

// const colors = ['#9C27B0', '#3F51B5', '#2196F3', '#009688', '#4CAF50', '#FF5722', '#F44336'];
// const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
const colors = ['#41B883', '#83CD29', '#F0DB4F', '#2589CA', '#A259FF', '#CB6699', '#F16529'];

export default function ColorChanger() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % colors.length);
      document.documentElement.style.setProperty('--color-primary', colors[index]);
    }, 3000); // 3秒ごとに色を切り替え

    return () => clearInterval(interval);
  }, [index]);

  return null; // UI上は何も表示しない
}
