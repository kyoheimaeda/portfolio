'use client';

import { useState, useEffect, useCallback } from 'react';
import { PhotoType } from '@/features/gallery/types/PhotoType';
import styles from '../../page.module.scss';
import { usePhotoManagement } from '@/features/gallery/hooks/usePhotoManagement';

// 新しく作成したタブコンテンツコンポーネントをインポート
import UploadTabContent from '../UploadTabContent';
import ManageTabContent from '../ManageTabContent';
import Dialog from '@/components/ui/Dialog'; // Dialog をインポート

export default function GalleryManager({ initialPhotos }: { initialPhotos: PhotoType[] }) {
  const { photos, setPhotos, loading, error, updatePhotoOrder, deletePhoto } = usePhotoManagement(initialPhotos);

  const [dbPhotosState, setDbPhotosState] = useState<PhotoType[]>([]);
  const [isProcessingSavePublish, setIsProcessingSavePublish] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload'); // アクティブなタブの状態

  // 通知モーダルの状態管理
  const [notificationModal, setNotificationModal] = useState<{ isOpen: boolean; title: string; message: string; } | null>(null);

  // 通知表示ヘルパー関数
  const showNotification = useCallback((message: string, title = '通知', duration = 3000) => {
    setNotificationModal({ isOpen: true, title, message });
    setTimeout(() => setNotificationModal(null), duration);
  }, []);

  const hasPendingReorderChanges = useCallback(() => {
    if (photos.length !== dbPhotosState.length) return false;
    for (let i = 0; i < photos.length; i++) {
      if (photos[i].id !== dbPhotosState[i].id) return true;
    }
    return false;
  }, [photos, dbPhotosState]);

  useEffect(() => {
    if (!loading && photos.length > 0 && dbPhotosState.length === 0) {
      setDbPhotosState(photos);
    }
  }, [loading, photos, dbPhotosState]);

  const handlePhotoUploaded = useCallback((newPhoto: PhotoType) => {
    const updatedPhotos = [...photos, newPhoto].sort((a, b) => a.order - b.order);
    setPhotos(updatedPhotos);
    setDbPhotosState(updatedPhotos);
    showNotification('写真がアップロードされ、公開ページに反映されました！', 'アップロード完了');
  }, [photos, setPhotos, showNotification]);

  const handlePhotoDeleted = useCallback(async (photo: PhotoType) => {
    try {
      await deletePhoto(photo);
      showNotification('写真が削除されました。', '削除完了');
      setDbPhotosState(prev => prev.filter(p => p.id !== photo.id));
    } catch (err) {
      console.error('削除処理エラー:', err);
      showNotification('写真の削除に失敗しました。', 'エラー');
    } finally {
      // setTimeout(() => setGlobalNotification(null), 3000); // showNotificationで管理されるため削除
    }
  }, [deletePhoto, setDbPhotosState, showNotification]);

  const handlePhotosReordered = useCallback((reorderedPhotos: PhotoType[]) => {
    const updatedPhotosWithOrder = reorderedPhotos.map((photo, index) => ({
      ...photo,
      order: index,
    }));
    setPhotos(updatedPhotosWithOrder);
    // showNotification('並び順が変更されました。公開するには「並び順を保存して公開」ボタンを押してください。', '並び順変更', 5000);
  }, [setPhotos]);

  const handleSaveAndPublish = useCallback(async () => {
    setIsProcessingSavePublish(true);
    try {
      await updatePhotoOrder(photos);
      setDbPhotosState(photos);
      showNotification('並び順が保存され、公開ページが更新されました！', '保存完了');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存と公開に失敗しました。';
      console.error('保存と公開エラー:', err);
      showNotification(errorMessage, 'エラー');
    } finally {
      setIsProcessingSavePublish(false);
    }
  }, [photos, updatePhotoOrder, showNotification]);

  if (error) return <p className={styles.errorText}>エラー: {error}</p>;

  return (
    <>
      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} c-button ${activeTab === 'upload' ? '' : 'outline'}`}
          onClick={() => setActiveTab('upload')}
        >
          アップロード
        </button>
        <button
          className={`${styles.tabButton} c-button ${activeTab === 'manage' ? '' : 'outline'}`}
          onClick={() => setActiveTab('manage')}
        >
          画像管理
        </button>
      </div>

      <div>
        {activeTab === 'upload' && (
          <UploadTabContent onPhotoUploaded={handlePhotoUploaded} />
        )}
        {activeTab === 'manage' && (
          <ManageTabContent
            photos={photos}
            onReorder={handlePhotosReordered}
            onDelete={handlePhotoDeleted}
            onSaveAndPublish={handleSaveAndPublish}
            isProcessingSavePublish={isProcessingSavePublish}
            hasPendingReorderChanges={hasPendingReorderChanges}
          />
        )}
      </div>

      {/* 通知モーダル */}
      {notificationModal && (
        <Dialog
          isOpen={notificationModal.isOpen}
          onClose={() => setNotificationModal(null)}
          title={notificationModal.title}
          message={notificationModal.message}
        />
      )}
    </>
  );
}