// src/app/gallery/manage/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
// createClient はこのファイルでは直接使用しないため削除
// import { createClient } from '@/lib/supabaseClient';
import { PhotoType } from '@/types/PhotoType';
// PhotoUploader をインポート
import PhotoUploader from './components/PhotoUploader';
// PhotoList から SortablePhotoList に変更
import SortablePhotoList from './components/SortablePhotoList';
import PageWrap from '@/components/layout/PageWrap';
import styles from './page.module.scss';
import { revalidateGalleryPage } from './actions';
// PostgrestError は使用しないため削除
// import { PostgrestError } from '@supabase/supabase-js';

// usePhotoManagement フックをインポート
import { usePhotoManagement } from '@/hooks/usePhotoManagement';

// 新しく切り出した SavePublishButton をインポート
import SavePublishButton from './components/SavePublishButton';


export default function ManageGalleryPage() { // ManageGalleryPage にリネーム
  // fetchPhotos はフック内で呼び出されるため、ここで分割代入する必要はない
  const { photos, loading, error, addPhoto, updatePhotoOrder, deletePhoto } = usePhotoManagement();

  // データベースから取得した写真の状態を保持（並び順の変更を検出するため）
  const [dbPhotosState, setDbPhotosState] = useState<PhotoType[]>([]);
  // グローバル通知用ステート
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);
  // 保存と公開の処理中ステータス
  const [isProcessingSavePublish, setIsProcessingSavePublish] = useState(false);
  const [savePublishStatus, setSavePublishStatus] = useState<string | null>(null);


  // photos の状態が更新されたら dbPhotosState も更新（初期ロード時と保存成功時）
  // ただし、並び替え中はdbPhotosStateを更新しないように注意
  useEffect(() => {
    // loading が false になったタイミングで dbPhotosState を初期化/更新
    // かつ、dbPhotosState がまだ空の場合にのみ実行
    if (!loading && photos.length > 0 && dbPhotosState.length === 0) {
      setDbPhotosState(photos);
    }
  }, [loading, photos, dbPhotosState.length]); // dbPhotosState.length を依存に加える


  // PhotoUploaderからアップロード成功通知を受け取った際のハンドラー
  const handlePhotoUploaded = useCallback(async (newPhoto: PhotoType) => {
    // addPhoto は usePhotoManagement から提供される
    try {
      await addPhoto(newPhoto);
      setGlobalNotification('写真がアップロードされました！');
      // アップロード後、dbPhotosState も更新して同期する
      setDbPhotosState(prev => [...prev, newPhoto].sort((a, b) => a.order - b.order));
    } catch (err) {
      console.error('アップロード後の処理エラー:', err);
      setGlobalNotification('写真のアップロード処理に失敗しました。');
    } finally {
      setTimeout(() => setGlobalNotification(null), 3000);
    }
  }, [addPhoto]);

  // PhotoListから写真削除通知を受け取った際のハンドラー
  const handlePhotoDeleted = useCallback(async (deletedPhotoId: string) => {
    try {
      await deletePhoto(deletedPhotoId);
      setGlobalNotification('写真が削除されました。');
      // 削除後、dbPhotosState も更新して同期する
      setDbPhotosState(prev => prev.filter(photo => photo.id !== deletedPhotoId));
    } catch (err) {
      console.error('削除処理エラー:', err);
      setGlobalNotification('写真の削除に失敗しました。');
    } finally {
      setTimeout(() => setGlobalNotification(null), 3000);
    }
  }, [deletePhoto]);

  // SortablePhotoListから並び替え通知を受け取った際のハンドラー
  const handlePhotosReordered = useCallback(async (reorderedPhotos: PhotoType[]) => {
    // UIを即座に更新するが、DB更新は行わない（SavePublishButtonで最終的に保存）
    // updatePhotoOrder は usePhotoManagement で UI も DB も更新する
    // ここでは onReorder prop を通じて updatePhotoOrder を呼び出す
    try {
      await updatePhotoOrder(reorderedPhotos);
      setGlobalNotification('並び順が変更されました。公開するには「並び順を保存して公開」ボタンを押してください。');
    } catch (err) {
      console.error('並び順更新エラー:', err);
      setGlobalNotification('並び順の更新に失敗しました。');
    } finally {
      setTimeout(() => setGlobalNotification(null), 5000);
    }
  }, [updatePhotoOrder]);


  // 並び順を保存して公開するハンドラー
  const handleSaveAndPublish = useCallback(async () => {
    setIsProcessingSavePublish(true);
    setSavePublishStatus('並び順を保存して公開中...');
    try {
      // revalidateGalleryPage は actions.ts で定義されているサーバーアクション
      // これにより、/gallery のキャッシュがクリアされ、最新の並び順が反映される
      await revalidateGalleryPage();
      setDbPhotosState(photos); // UIの状態がDBに反映されたので、dbPhotosState と同期
      setSavePublishStatus('並び順が保存され、公開ページが更新されました！');
      setGlobalNotification(null); // 並び順の通知はクリア
    } catch (err) {
      console.error('保存と公開エラー:', err);
      let errorMessage = '保存と公開に失敗しました。';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setSavePublishStatus(errorMessage);
    } finally {
      setIsProcessingSavePublish(false);
      setTimeout(() => setSavePublishStatus(null), 5000);
    }
  }, [photos]);


  if (loading) {
    return <p className={styles.loadingText}>写真を読み込み中...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>エラー: {error}</p>;
  }

  return (
    <PageWrap title="EDIT">
      {/* 全体通知の表示 */}
      {globalNotification && (
        <div className={styles.notification}>
          <div className={styles.notificationBox}>
            <p>{globalNotification}</p>
          </div>
        </div>
      )}

      {/* PhotoUploader コンポーネント */}
      {/* プロップス名を onUpload に変更し、usePhotoManagementのaddPhotoを渡す */}
      <PhotoUploader onUpload={handlePhotoUploaded} />

      {/* 「保存して公開」ボタン */}
      {/* 独立したコンポーネントとしてインポート */}
      <SavePublishButton
        photos={photos}
        dbPhotosState={dbPhotosState}
        onSaveAndPublish={handleSaveAndPublish}
        isProcessing={isProcessingSavePublish}
        statusMessage={savePublishStatus}
      />

      {/* SortablePhotoList コンポーネント (並び替えと削除機能を含む) */}
      <div className={styles.photoList}>
        {photos.length === 0 ? (
          <p>No Data</p>
        ) : (
          <SortablePhotoList // PhotoList から SortablePhotoList に変更
            photos={photos}
            onReorder={handlePhotosReordered} // updatePhotoOrder を onReorder に渡す
            onDelete={handlePhotoDeleted} // deletePhoto を onDelete に渡す
          />
        )}
      </div>
    </PageWrap>
  );
}