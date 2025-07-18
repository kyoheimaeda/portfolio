// src/app/gallery/manage/components/DeletePhotoButton/index.tsx

'use client'; // クライアントコンポーネントであることを明示

import React, { useState } from 'react';
// import { createClient } from '@/lib/supabaseClient'; // ★ DB操作はAPIルートで行うため削除
import { PhotoType } from '@/types/PhotoType'; // PhotoTypeのパスを確認してください

// SCSS モジュールのインポート
import styles from './index.module.scss';

// ----------------------------------------
// Types

type DeletePhotoButtonProps = {
  photo: PhotoType;
  onDelete: (deletedPhotoId: string) => void;
};

// ----------------------------------------
// Component

export default function DeletePhotoButton({ photo, onDelete }: DeletePhotoButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const supabase = createClient(); // ★ DB操作はAPIルートで行うため削除

  const handleDelete = async () => {
    if (!confirm(`「${photo.original_file_name}」を本当に削除しますか？`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      // ★ 新しいAPIルートに削除リクエストを送信
      const response = await fetch('/api/delete-image', {
        method: 'POST', // または 'DELETE' を使うことも可能。APIルートと合わせる
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: photo.id,   // データベースレコードのID
          path: photo.path, // R2のオブジェクトキー（例: images/gallery/ファイル名）
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Unknown error during deletion.');
      }

      // 削除成功
      onDelete(photo.id); // 親コンポーネントに削除されたIDを伝える

    } catch (err: unknown) { // ★修正: unknown型で捕捉
      console.error('削除中にエラーが発生しました:', err);
      let errorMessage = '不明なエラー';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      // errがErrorインスタンスではないが、messageプロパティを持つ可能性があるオブジェクトの場合
      else if (typeof err === 'object' && err !== null && 'message' in err) {
        // messageプロパティが文字列であることを確認して使用
        if (typeof (err as { message: unknown }).message === 'string') {
          errorMessage = (err as { message: string }).message;
        }
      }
      setError(`削除に失敗しました: ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.deleteButtonContainer}>
      <button onClick={handleDelete} disabled={deleting} className={styles.deleteButton}>
        {deleting ? '削除中...' : '削除'}
      </button>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
}