'use client';

// --------------------------------------------------
// Imports

import React from 'react';
import Image from 'next/image';
import { PhotoType } from '@/features/gallery/types/PhotoType';

// SCSS モジュールのインポート
import styles from "./index.module.scss";

// --------------------------------------------------
// Types

type PhotoItemProps = {
  photo: PhotoType;
  onClick: (e: React.MouseEvent<HTMLElement>) => void; // クリックイベントを親から受け取る
};

// --------------------------------------------------
// Component

export default function PhotoItem({ photo, onClick }: PhotoItemProps) {
  return (
    <li key={photo.id} onClick={onClick} className={styles.photoItem}> {/* クラス名も photoItem に変更の可能性あり */}
      <a className={styles.link}>
        <Image
          src={photo.url}
          alt={`Gallery photo: ${photo.id}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        />
      </a>
    </li>
  );
}