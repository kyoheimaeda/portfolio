'use client';

// ----------------------------------------
// Imports

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

// ----------------------------------------
// Types

type DeletePhotoButtonProps = {
  photoId: string; // 削除する写真のID
  onDeleteSuccess: (deletedPhotoId: string) => void; // 削除成功時に親に通知するコールバック
};


// ----------------------------------------
// SCSS
import styles from './index.module.scss';

import { LuLoaderCircle } from "react-icons/lu";
import { LuX } from "react-icons/lu";

// ----------------------------------------
// Component

export default function DeletePhotoButton({ photoId, onDeleteSuccess }: DeletePhotoButtonProps) {
  const [notification, setNotification] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    setNotification(null); // 削除試行前に通知をクリア

    const supabase = createClient();
    const { error } = await supabase.from('photos').delete().eq('id', photoId);

    if (error) {
      console.error('写真削除エラー:', error);
      setNotification('削除に失敗しました: ' + error.message);
      setTimeout(() => setNotification(null), 3000);
    } else {
      setNotification('写真を削除しました');
      onDeleteSuccess(photoId); // 削除成功を親に通知
      setTimeout(() => setNotification(null), 3000);
    }
    setDeleting(false);
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <button
        className={styles.button}
        onClick={handleDelete}
        disabled={deleting}
      >
        {deleting ? <LuLoaderCircle /> : <LuX />}
      </button>
      {notification && (
        <p className={styles.notification}>
          {notification}
        </p>
      )}
    </div>
  );
}
