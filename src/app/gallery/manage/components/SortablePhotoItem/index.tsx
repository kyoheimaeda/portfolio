// src/app/gallery/manage/components/SortablePhotoItem/index.tsx

'use client';

// --------------------------------------------------

import React, { useState } from 'react';
import { PhotoType } from '@/features/gallery/types/PhotoType';

// dnd-kit のインポート
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// react-icons のインポート
import { LuGripVertical, LuTrash2 } from "react-icons/lu";

// SCSS モジュールのインポート
import styles from './index.module.scss';
import Image from 'next/image';
import Dialog from '@/components/ui/Dialog'; // Dialog をインポート


// --------------------------------------------------
// Types

interface SortablePhotoItemProps {
  photo: PhotoType;
  onDelete: (photo: PhotoType) => Promise<void>;
}


// --------------------------------------------------
// Component

export default function SortablePhotoItem({ photo, onDelete }: SortablePhotoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false); // 削除確認モーダルの表示状態

  const handleDeleteClick = () => {
    setShowConfirmDeleteModal(true); // 確認モーダルを表示
  };

  const handleConfirmDelete = async () => {
    setShowConfirmDeleteModal(false); // モーダルを閉じる
    setIsDeleting(true);
    try {
      await onDelete(photo);
    } catch (error) {
      console.error("Deletion failed in SortablePhotoItem:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDeleteModal(false); // モーダルを閉じる
  };

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
        <button
          {...listeners}
          {...attributes}
          className={styles.actionsHandle}
          title="ドラッグして並び替え"
        >
          <LuGripVertical />
        </button>
        <button onClick={handleDeleteClick} disabled={isDeleting} className={styles.actionsDelete}>
          <LuTrash2 />
        </button>
      </div>

      <Dialog
        isOpen={showConfirmDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="写真の削除"
        message={`「${photo.original_file_name}」を本当に削除しますか？`}
        confirmText="削除"
        cancelText="キャンセル"
        isProcessing={isDeleting}
      />
    </li>
  );
}