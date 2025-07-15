'use client';

// --------------------------------------------------

import React from 'react';
import { PhotoType } from '@/types/PhotoType'; // PhotoTypeのパスを適切に調整
import DeletePhotoButton from '../DeletePhotoButton'; // 削除ボタンをインポート

// dnd-kit のインポート
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// react-icons のインポート
import { LuGrip } from "react-icons/lu";

// SCSS モジュールのインポート
import styles from './index.module.scss'; // ★ 新しいSCSSモジュールをインポート



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
    listeners, // ドラッグハンドルにアタッチするリスナー
    setNodeRef,
    transform,
    transition,
    isDragging // ドラッグ中かどうか
  } = useSortable({ id: photo.id, disabled: false }); // ドラッグを常に有効にする

  // dnd-kit の transform と transition を CSS 変数として適用
  // これらはインラインスタイルとして残す必要があります
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
          <img src={photo.url} alt={`Photo ${photo.id}`} />
        </figure>
      </div>
      <div className={styles.actions}>
        {/* 削除ボタン */}
        <DeletePhotoButton photoId={photo.id} onDeleteSuccess={onPhotoDeleted} />

        {/* ドラッグハンドル */}
        <button
          {...listeners} // このbuttonにドラッグリスナーをアタッチ
          {...attributes} // このbuttonにドラッグ属性をアタッチ
          className={styles.dragHandle} // SCSSクラスを適用
          title="ドラッグして並び替え"
        >
          <LuGrip size={20} /> {/* 並び替えアイコン */}
        </button>
      </div>
    </li>
  );
}
