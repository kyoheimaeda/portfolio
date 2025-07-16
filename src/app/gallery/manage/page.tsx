// src/app/gallery/manage/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { PhotoType } from '@/types/PhotoType';
import PhotoUploader from './components/PhotoUploader';
import PhotoList from './components/PhotoList';
import styles from './page.module.scss';
import { revalidateGalleryPage } from './actions';
// ★ PostgrestError をインポート
import { PostgrestError } from '@supabase/supabase-js';


// --- Save & Publish Button Component ---
// このコンポーネントが並び替えの保存と公開ページの更新を担当します
function SavePublishButton({
  photos, // 現在のUI上の写真データ（並び順を含む）
  dbPhotosState, // データベースに最後に保存された写真データ（並び順を含む）
  onSaveAndPublish, // 親コンポーネントで定義された保存と公開のハンドラー
  isProcessing, // 処理中フラグ
  statusMessage, // 表示するステータスメッセージ
}: {
  photos: PhotoType[];
  dbPhotosState: PhotoType[];
  onSaveAndPublish: () => Promise<void>;
  isProcessing: boolean;
  statusMessage: string | null;
}) {

  // UI上の並び順とDBに保存されている並び順に違いがあるかチェック
  const hasPendingReorderChanges = useCallback(() => {
    // 要素数が異なる場合は並び順の変更ではなく、アップロード/削除なのでここでは検知しない
    if (photos.length !== dbPhotosState.length) {
      return false;
    }
    // 同じ長さの場合、各要素のIDの順序が異なるかを確認
    for (let i = 0; i < photos.length; i++) {
      if (photos[i].id !== dbPhotosState[i].id) {
        return true; // IDの順序が異なれば、並び替えの変更がある
      }
    }
    return false; // 並び順に変化なし
  }, [photos, dbPhotosState]);


  return (
    <div className={styles.savePublishContainer}>
      <button
        onClick={onSaveAndPublish}
        disabled={isProcessing} // 処理中はボタンを無効化
        className={styles.savePublishButton}
      >
        {isProcessing // 処理中の表示
          ? '処理中...'
          : hasPendingReorderChanges() // 並び替えの未保存変更がある場合
            ? '並び順を保存して公開'
            : '公開ページを更新' // 並び替えの未保存変更がない場合（アップロード/削除後の公開など）
        }
      </button>
      {statusMessage && <p className={styles.savePublishStatus}>{statusMessage}</p>}
    </div>
  );
}
// --- End: Save & Publish Button Component ---


export default function GalleryManagePage() {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  // データベースの最新の状態（または最後に保存された状態）を追跡するためのState
  const [dbPhotosState, setDbPhotosState] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);

  // 保存・公開ボタン用のステート
  const [isProcessingSavePublish, setIsProcessingSavePublish] = useState(false);
  const [savePublishStatus, setSavePublishStatus] = useState<string | null>(null);


  // 写真データをフェッチする関数
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error: fetchError } = await supabase.from('photos').select('*').order('order', { ascending: true }).order('created_at', { ascending: false });

    if (fetchError) {
      setError('写真の取得に失敗しました: ' + fetchError.message);
    } else if (data) {
      setPhotos(data as PhotoType[]);
      setDbPhotosState(data as PhotoType[]); // DBの状態も初期化
    }
    setLoading(false);
  }, []);

  // 初回ロード時に写真をフェッチ
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);


  // 「保存して公開」ボタンのハンドラー
  const handleSaveAndPublish = async () => {
    setIsProcessingSavePublish(true);
    setSavePublishStatus('変更を保存し、公開ページを更新中...');

    try {
      const supabase = createClient();
      let statusMessageText = '';
      let reorderChangesSaved = false;

      const hasPendingReorderChanges = (() => {
        if (photos.length !== dbPhotosState.length) return false;
        for (let i = 0; i < photos.length; i++) {
          if (photos[i].id !== dbPhotosState[i].id) {
            return true;
          }
        }
        return false;
      })();


      if (hasPendingReorderChanges) {
        const updates = photos.map((p, idx) => ({ id: p.id, order: idx }));
        const { error: updateError } = await supabase.from('photos').upsert(updates, { onConflict: 'id' });

        if (updateError) {
          throw new Error('写真の並び順の保存に失敗しました: ' + updateError.message);
        }
        setDbPhotosState(photos);
        reorderChangesSaved = true;
        statusMessageText += '並び順を保存しました。';
      } else {
        statusMessageText += '並び順の変更はありませんでした。';
      }

      await revalidateGalleryPage();
      statusMessageText += '公開ページが更新されました！';

      setSavePublishStatus(statusMessageText);

      if (reorderChangesSaved) {
        setGlobalNotification('並び順の変更が保存され、公開ページが更新されました！');
      } else {
        setGlobalNotification('公開ページが更新されました！');
      }
      setTimeout(() => setGlobalNotification(null), 5000);

    } catch (error: unknown) { // ★ ここを unknown に変更
      // ★ ここに型ガードを追加して PostgrestError を使用
      let errorMessage = '不明なエラー';
      if (error instanceof PostgrestError) { // PostgrestError のインスタンスであるかチェック
        errorMessage = 'Supabase エラー: ' + error.message;
      } else if (error instanceof Error) { // 通常の Error オブジェクトであるかチェック
        errorMessage = error.message;
      }

      console.error('保存または公開ページの更新に失敗しました:', error);
      setSavePublishStatus('保存または公開ページの更新に失敗しました: ' + errorMessage);
      setGlobalNotification('公開ページの更新に失敗しました。');
      setTimeout(() => setGlobalNotification(null), 5000);
    } finally {
      setIsProcessingSavePublish(false);
      setTimeout(() => setSavePublishStatus(null), 5000);
    }
  };


  // PhotoUploaderからアップロード通知を受け取った際のハンドラー
  const handlePhotoUploaded = async (newPhoto: PhotoType) => {
    const supabase = createClient();
    const maxOrder = photos.reduce((max, p) => Math.max(max, p.order || 0), 0);
    const photoWithOrder = { ...newPhoto, order: maxOrder + 1 };

    // DBの order も更新 - これはすぐに実行
    const { error: updateError } = await supabase.from('photos').update({ order: photoWithOrder.order }).eq('id', photoWithOrder.id);

    if (updateError) {
      console.error('新しい写真の順序保存エラー:', updateError);
      setGlobalNotification('新しい写真の順序保存に失敗しました: ' + updateError.message);
      setTimeout(() => setGlobalNotification(null), 5000);
      setPhotos(prevPhotos => [...prevPhotos, photoWithOrder].sort((a, b) => (a.order || 0) - (b.order || 0)));
    } else {
      const updatedPhotos = [...photos, photoWithOrder].sort((a, b) => (a.order || 0) - (b.order || 0));
      setPhotos(updatedPhotos);
      setDbPhotosState(updatedPhotos); // DBに即時反映されたので、DBの状態も更新
      setGlobalNotification('新しい写真をアップロードしました！');
      setTimeout(() => setGlobalNotification(null), 3000);
    }
  };

  // PhotoListから削除通知を受け取った際のハンドラー (DeletePhotoButton経由)
  const handlePhotoDeleted = async (deletedId: string) => {
    // Supabaseからの削除は即時実行
    const supabase = createClient();
    const { error: deleteError } = await supabase.from('photos').delete().eq('id', deletedId);

    if (deleteError) {
      console.error('写真の削除エラー:', deleteError);
      setGlobalNotification('写真の削除に失敗しました: ' + deleteError.message);
      setTimeout(() => setGlobalNotification(null), 5000);
    } else {
      const updatedPhotos = photos.filter(photo => photo.id !== deletedId);
      setPhotos(updatedPhotos);
      setDbPhotosState(updatedPhotos); // DBに即時反映されたので、DBの状態も更新
      setGlobalNotification('写真を削除しました！');
      setTimeout(() => setGlobalNotification(null), 3000);
    }
  };

  // PhotoListから並び替え通知を受け取った際のハンドラー
  const handlePhotosReordered = useCallback((reorderedPhotos: PhotoType[]) => {
    // UIを即座に更新するが、DB更新は行わない
    setPhotos(reorderedPhotos);
    setGlobalNotification('並び順が変更されました。公開するには「並び順を保存して公開」ボタンを押してください。');
    setTimeout(() => setGlobalNotification(null), 5000);
  }, []); // 依存配列は空でOK

  if (loading) {
    return <p className={styles.loadingText}>写真を読み込み中...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>エラー: {error}</p>;
  }

  return (
    <section className={styles.section}>
      <div className="l-inner">
        {/* 全体通知の表示 */}
        {globalNotification && (
          <div className={styles.notification}>
            <div className={styles.notificationBox}>
              <p>{globalNotification}</p>
            </div>
          </div>
        )}

        {/* PhotoUploader コンポーネント */}
        <PhotoUploader onPhotoUploaded={handlePhotoUploaded} />

        {/* 「保存して公開」ボタン */}
        <SavePublishButton
          photos={photos}
          dbPhotosState={dbPhotosState}
          onSaveAndPublish={handleSaveAndPublish}
          isProcessing={isProcessingSavePublish}
          statusMessage={savePublishStatus}
        />

        {/* PhotoList コンポーネント (並び替えと削除機能を含む) */}
        <div className={styles.photoList}>
          {photos.length === 0 ? (
            <p>No Data</p>
          ) : (
            <PhotoList photos={photos} onPhotosReordered={handlePhotosReordered} onPhotoDeleted={handlePhotoDeleted} />
          )}
        </div>
      </div>
    </section>
  );
}