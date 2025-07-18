// src/app/gallery/manage/components/SortablePhotoItem/index.tsx

'use client';

// --------------------------------------------------

import React from 'react';
import { PhotoType } from '@/types/PhotoType';
import DeletePhotoButton from '../DeletePhotoButton'; // ここは変更なし

// dnd-kit のインポート
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// react-icons のインポート
import { LuGrip } from "react-icons/lu";

// SCSS モジュールのインポート
import styles from './index.module.scss';
import Image from 'next/image';


// --------------------------------------------------
// Types

interface SortablePhotoItemProps {
  photo: PhotoType;
  onDelete: (deletedPhotoId: string) => Promise<void>;
}


// --------------------------------------------------
// Component

export default function SortablePhotoItem({ photo, onDelete }: SortablePhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: photo.id, disabled: false });

  const itemStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={itemStyle}
      className={`${styles.photoItem} ${isDragging ? styles.isDragging : ''}`}
    >
      <div className={styles.imageBox}>
        <figure>
          <Image
            src={photo.url}
            alt={`Photo ${photo.id}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            style={{
              objectFit: 'cover',
            }}
          />
        </figure>
      </div>
      <div className={styles.actions}>
        {/* ★ここを修正しました★ photoId={photo.id} を photo={photo} に変更 */}
        <DeletePhotoButton photo={photo} onDelete={onDelete} />

        <button
          {...listeners}
          {...attributes}
          className={styles.dragHandle}
          title="ドラッグして並び替え"
        >
          <LuGrip size={20} />
        </button>
      </div>
    </li>
  );
}