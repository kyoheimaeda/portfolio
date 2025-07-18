// src/app/gallery/manage/components/SavePublishButton/index.tsx

'use client'; // クライアントコンポーネントなので必須

// --------------------------------------------------
// Imports
import { useCallback } from 'react';
import { PhotoType } from '@/types/PhotoType';
import styles from './index.module.scss';

// --------------------------------------------------
// Types

type SavePublishButtonProps = {
  photos: PhotoType[]; // 現在のUI上の写真データ（並び順を含む）
  dbPhotosState: PhotoType[]; // データベースに最後に保存された写真データ（並び順を含む）
  onSaveAndPublish: () => Promise<void>; // 親コンポーネントで定義された保存と公開のハンドラー
  isProcessing: boolean; // 処理中フラグ
  statusMessage: string | null; // 表示するステータスメッセージ
};

// --------------------------------------------------
// Component

export default function SavePublishButton({
  photos,
  dbPhotosState,
  onSaveAndPublish,
  isProcessing,
  statusMessage,
}: SavePublishButtonProps) {

  // UI上の並び順とDBに保存されている並び順に違いがあるかチェック
  const hasPendingReorderChanges = useCallback(() => {
    // 要素数が異なる場合は並び順の変更ではなく、アップロード/削除なのでここでは検知しない
    if (photos.length !== dbPhotosState.length) {
      return false; // アップロード/削除は含まない
    }

    // 各写真のIDとorderが一致するかをチェック
    // 完全に同じ順序であれば変更なしと判断
    for (let i = 0; i < photos.length; i++) {
      if (photos[i].id !== dbPhotosState[i].id) {
        return true; // IDが異なる場合（＝順序が変更された）
      }
    }
    return false; // 全て一致
  }, [photos, dbPhotosState]);

  const showSaveButton = hasPendingReorderChanges() && !isProcessing;

  return (
    <div className={styles.savePublishContainer}>
      {statusMessage && (
        <div className={styles.statusMessage}>
          <p>{statusMessage}</p>
        </div>
      )}
      {showSaveButton && (
        <button
          onClick={onSaveAndPublish}
          disabled={isProcessing}
          className={styles.saveButton}
        >
          {isProcessing ? '処理中...' : '並び順を保存して公開'}
        </button>
      )}
    </div>
  );
}