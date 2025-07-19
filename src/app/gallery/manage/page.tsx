'use client';

import { useState, useEffect, useCallback } from 'react';
import { PhotoType } from '@/features/gallery/types/PhotoType';
import PageWrap from '@/components/layout/PageWrap';
import styles from './page.module.scss';
import { usePhotoManagement } from '@/features/gallery/hooks/usePhotoManagement';

// 新しく作成したタブコンテンツコンポーネントをインポート
import UploadTabContent from './components/UploadTabContent';
import ManageTabContent from './components/ManageTabContent';

export default function ManageGalleryPage() {
  const { photos, setPhotos, loading, error, updatePhotoOrder, deletePhoto } = usePhotoManagement();

  const [dbPhotosState, setDbPhotosState] = useState<PhotoType[]>([]);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);
  const [isProcessingSavePublish, setIsProcessingSavePublish] = useState(false);
  const [savePublishStatus, setSavePublishStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'manage'>('upload'); // アクティブなタブの状態

  // 通知表示ヘルパー関数
  const showNotification = useCallback((message: string, duration = 3000) => {
    setGlobalNotification(message);
    setTimeout(() => setGlobalNotification(null), duration);
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
    showNotification('写真がアップロードされ、公開ページに反映されました！');
  }, [photos, setPhotos, showNotification]);

  const handlePhotoDeleted = useCallback(async (photo: PhotoType) => {
    try {
      await deletePhoto(photo);
      showNotification('写真が削除されました。');
      setDbPhotosState(prev => prev.filter(p => p.id !== photo.id));
    } catch (err) {
      console.error('削除処理エラー:', err);
      showNotification('写真の削除に失敗しました。');
    }
  }, [deletePhoto, setDbPhotosState, showNotification]);

  const handlePhotosReordered = useCallback((reorderedPhotos: PhotoType[]) => {
    const updatedPhotosWithOrder = reorderedPhotos.map((photo, index) => ({
      ...photo,
      order: index,
    }));
    setPhotos(updatedPhotosWithOrder);
    showNotification('並び順が変更されました。公開するには「並び順を保存して公開」ボタンを押してください。', 5000);
  }, [setPhotos, showNotification]);

  const handleSaveAndPublish = useCallback(async () => {
    setIsProcessingSavePublish(true);
    setSavePublishStatus('並び順を保存して公開中...');
    try {
      await updatePhotoOrder(photos);
      setDbPhotosState(photos);
      setSavePublishStatus('並び順が保存され、公開ページが更新されました！');
      setGlobalNotification(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '保存と公開に失敗しました。';
      setSavePublishStatus(errorMessage);
      console.error('保存と公開エラー:', err);
    } finally {
      setIsProcessingSavePublish(false);
      setTimeout(() => setSavePublishStatus(null), 5000);
    }
  }, [photos, updatePhotoOrder]);

  if (loading) return <p className={styles.loadingText}>写真を読み込み中...</p>;
  if (error) return <p className={styles.errorText}>エラー: {error}</p>;

  return (
    <PageWrap>
      {globalNotification && (
        <div className={styles.notification}>
          <div className={styles.notificationBox}>
            <p>{globalNotification}</p>
          </div>
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'upload' ? styles.active : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          新規追加
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'manage' ? styles.active : ''}`}
          onClick={() => setActiveTab('manage')}
        >
          画像管理
        </button>
      </div>

      <div className={styles.tabContent}>
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
            savePublishStatus={savePublishStatus}
            hasPendingReorderChanges={hasPendingReorderChanges}
          />
        )}
      </div>
    </PageWrap>
  );
}
