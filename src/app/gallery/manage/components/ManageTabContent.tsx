'use client';

import React from 'react';
import SortablePhotoList from './SortablePhotoList';
import { PhotoType } from '@/features/gallery/types/PhotoType';
import styles from '../page.module.scss'; // manage/page.module.scss を参照

type ManageTabContentProps = {
  photos: PhotoType[];
  onReorder: (reorderedPhotos: PhotoType[]) => void;
  onDelete: (photo: PhotoType) => Promise<void>;
  onSaveAndPublish: () => Promise<void>;
  isProcessingSavePublish: boolean;
  savePublishStatus: string | null;
  hasPendingReorderChanges: () => boolean;
};

export default function ManageTabContent({
  photos,
  onReorder,
  onDelete,
  onSaveAndPublish,
  isProcessingSavePublish,
  savePublishStatus,
  hasPendingReorderChanges,
}: ManageTabContentProps) {
  return (
    <>
      {/* 「保存して公開」ボタン */}
      <div className={styles.savePublishContainer}>
        {savePublishStatus && (
          <div className={styles.statusMessage}>
            <p>{savePublishStatus}</p>
          </div>
        )}
        {hasPendingReorderChanges() && !isProcessingSavePublish && (
          <button
            onClick={onSaveAndPublish}
            disabled={isProcessingSavePublish}
            className={styles.saveButton}
          >
            {isProcessingSavePublish ? '処理中...' : '並び順を保存して公開'}
          </button>
        )}
      </div>

      {/* SortablePhotoList コンポーネント (並び替えと削除機能を含む) */}
      <div>
        {photos.length === 0 ? (
          <p>No Data</p>
        ) : (
          <SortablePhotoList
            photos={photos}
            onReorder={onReorder}
            onDelete={onDelete}
          />
        )}
      </div>
    </>
  );
}
