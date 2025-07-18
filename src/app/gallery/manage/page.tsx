'use client';

import { useState, useEffect, useCallback } from 'react';
import { PhotoType } from '@/features/gallery/types/PhotoType';
import PhotoUploader from './components/PhotoUploader';
import SortablePhotoList from './components/SortablePhotoList';
import PageWrap from '@/components/layout/PageWrap';
import styles from './page.module.scss';
import { usePhotoManagement } from '@/features/gallery/hooks/usePhotoManagement';

export default function ManageGalleryPage() {
  const { photos, setPhotos, loading, error, updatePhotoOrder, deletePhoto } = usePhotoManagement();

  const [dbPhotosState, setDbPhotosState] = useState<PhotoType[]>([]);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);
  const [isProcessingSavePublish, setIsProcessingSavePublish] = useState(false);
  const [savePublishStatus, setSavePublishStatus] = useState<string | null>(null);

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
  }, [loading, photos, dbPhotosState.length]);

  const handlePhotoUploaded = useCallback((newPhoto: PhotoType) => {
    const updatedPhotos = [...photos, newPhoto].sort((a, b) => a.order - b.order);
    setPhotos(updatedPhotos);
    setDbPhotosState(updatedPhotos);
    setGlobalNotification('写真がアップロードされ、公開ページに反映されました！');
    setTimeout(() => setGlobalNotification(null), 3000);
    // console.log('handlePhotoUploaded: photos state after upload:', photos);
    // console.log('handlePhotoUploaded: dbPhotosState after upload:', dbPhotosState);
  }, [photos, setPhotos]);

  const handlePhotoDeleted = useCallback(async (photo: PhotoType) => {
    try {
      await deletePhoto(photo);
      setGlobalNotification('写真が削除されました。');
      setDbPhotosState(prev => prev.filter(p => p.id !== photo.id));
    } catch (err) {
      console.error('削除処理エラー:', err);
      setGlobalNotification('写真の削除に失敗しました。');
    } finally {
      setTimeout(() => setGlobalNotification(null), 3000);
    }
  }, [deletePhoto, setDbPhotosState]);

  const handlePhotosReordered = useCallback((reorderedPhotos: PhotoType[]) => {
    // 並び替えられた写真のorderプロパティを新しいインデックスに更新
    const updatedPhotosWithOrder = reorderedPhotos.map((photo, index) => ({
      ...photo,
      order: index, // 0から始まるインデックスをorderとして設定
    }));
    setPhotos(updatedPhotosWithOrder);
    setGlobalNotification('並び順が変更されました。公開するには「並び順を保存して公開」ボタンを押してください。');
    setTimeout(() => setGlobalNotification(null), 5000);
  }, [setPhotos]);

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
    <PageWrap title="EDIT">
      {globalNotification && (
        <div className={styles.notification}>
          <div className={styles.notificationBox}>
            <p>{globalNotification}</p>
          </div>
        </div>
      )}

      <PhotoUploader onUpload={handlePhotoUploaded} />

      <div className={styles.savePublishContainer}>
        {savePublishStatus && (
          <div className={styles.statusMessage}>
            <p>{savePublishStatus}</p>
          </div>
        )}
        {hasPendingReorderChanges() && !isProcessingSavePublish && (
          <button
            onClick={handleSaveAndPublish}
            disabled={isProcessingSavePublish}
            className={styles.saveButton}
          >
            {isProcessingSavePublish ? '処理中...' : '並び順を保存して公開'}
          </button>
        )}
      </div>

      <div className={styles.photoList}>
        {photos.length === 0 ? (
          <p>No Data</p>
        ) : (
          <SortablePhotoList
            photos={photos}
            onReorder={handlePhotosReordered}
            onDelete={handlePhotoDeleted}
          />
        )}
      </div>
    </PageWrap>
  );
}
