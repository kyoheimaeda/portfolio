'use client';

// --------------------------------------------------

import React from 'react';
import { PhotoType } from '@/types/PhotoType';
import DeletePhotoButton from '../DeletePhotoButton';

// dnd-kit のインポート
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// react-icons のインポート
import { LuGrip } from "react-icons/lu";

// SCSS モジュールのインポート
import styles from './index.module.scss';
import Image from 'next/image'; // Image コンポーネントをインポート


// --------------------------------------------------
// Types


interface SortablePhotoItemProps {
  photo: PhotoType;
  onPhotoDeleted: (deletedPhotoId: string) => void;
}



// --------------------------------------------------
// Component

export default function SortablePhotoItem({ photo, onPhotoDeleted }: SortablePhotoItemProps) {
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
      <div className={styles.imageBox}> {/* 親要素に position: relative; が必要 */}
        <figure>
          {/* <img> タグを <Image /> コンポーネントに置き換え */}
          <Image
            src={photo.url}
            alt={`Photo ${photo.id}`}
            fill // 親要素 (figure または imageBox) のサイズを埋める
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" // ギャラリーのレイアウトに合わせて調整
            style={{
              objectFit: 'cover', // または 'contain'。親要素に画像をどのようにフィットさせるか
            }}
          />
        </figure>
      </div>
      <div className={styles.actions}>
        <DeletePhotoButton photoId={photo.id} onDeleteSuccess={onPhotoDeleted} />

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