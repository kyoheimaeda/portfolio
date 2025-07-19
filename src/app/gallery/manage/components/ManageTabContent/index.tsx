'use client';

import React from 'react';
import SortablePhotoList from '../SortablePhotoList';
import { GalleryImageType } from '@/features/gallery/types/GalleryImageType';
import { motion, AnimatePresence } from 'motion/react'; // motion をインポート
import styles from './index.module.scss'; // index.module.scss を参照

type ManageTabContentProps = {
  photos: GalleryImageType[];
  onReorder: (reorderedPhotos: GalleryImageType[]) => void;
  onDelete: (photo: GalleryImageType) => Promise<void>;
  onSaveAndPublish: () => Promise<void>;
  isProcessingSavePublish: boolean;
  hasPendingReorderChanges: () => boolean;
};

export default function ManageTabContent({
  photos,
  onReorder,
  onDelete,
  onSaveAndPublish,
  isProcessingSavePublish,
  hasPendingReorderChanges,
}: ManageTabContentProps) {
  return (
    <>
      {/* SortablePhotoList コンポーネント (並び替えと削除機能を含む) */}
      <div /* className={styles.photoList} */>
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

      {/* 並び順を保存して公開ボタン */}
      <AnimatePresence>
        {hasPendingReorderChanges() && !isProcessingSavePublish && (
          <motion.div
            className={styles.savePublishButtonFixedContainer}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <button
              onClick={onSaveAndPublish}
              disabled={isProcessingSavePublish}
              className={`${styles.saveButtonFixed} c-button`}
            >
              {isProcessingSavePublish ? '処理中...' : '並び順を保存して公開'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}