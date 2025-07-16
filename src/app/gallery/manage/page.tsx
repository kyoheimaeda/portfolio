'use client'; // Client Component であることを宣言

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { PhotoType } from '@/types/PhotoType';
import PhotoUploader from './components/PhotoUploader';
import PhotoList from './components/PhotoList';
import styles from './page.module.scss';
import { revalidateGalleryPage } from './actions'; // サーバーアクションをインポート

export default function GalleryManagePage() {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null); // 全体通知用のステート

  // 写真データをフェッチする関数
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    // order カラムで昇順にソート。order がない場合は created_at で降順
    const { data, error: fetchError } = await supabase.from('photos').select('*').order('order', { ascending: true }).order('created_at', { ascending: false });

    if (fetchError) {
      setError('写真の取得に失敗しました: ' + fetchError.message);
    } else if (data) {
      setPhotos(data as PhotoType[]);
    }
    setLoading(false);
  }, []);

  // 初回ロード時に写真をフェッチ
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]); // fetchPhotos を依存配列に追加

  // PhotoUploaderからアップロード通知を受け取った際のハンドラー
  const handlePhotoUploaded = async (newPhoto: PhotoType) => {
    const supabase = createClient();
    // 現在の最大 order + 1 を新しい order とする
    const maxOrder = photos.reduce((max, p) => Math.max(max, p.order || 0), 0);
    const photoWithOrder = { ...newPhoto, order: maxOrder + 1 };

    // DBの order も更新
    const { error: updateError } = await supabase.from('photos').update({ order: photoWithOrder.order }).eq('id', photoWithOrder.id);

    if (updateError) {
      console.error('新しい写真の順序保存エラー:', updateError);
      setGlobalNotification('新しい写真の順序保存に失敗しました: ' + updateError.message);
      setTimeout(() => setGlobalNotification(null), 5000);
      // エラーでも一旦リストには追加するが、順序は期待通りにならない可能性
      setPhotos(prevPhotos => [...prevPhotos, photoWithOrder].sort((a, b) => a.order - b.order));
    } else {
      // 新しい写真をリストに追加して更新し、orderでソート
      setPhotos(prevPhotos => [...prevPhotos, photoWithOrder].sort((a, b) => a.order - b.order));
      setGlobalNotification('新しい写真をアップロードしました！');
      setTimeout(() => setGlobalNotification(null), 3000);
      console.log(`New photo uploaded: ${newPhoto.url}`);
    }

    // ★ ギャラリーページのキャッシュを再検証
    await revalidateGalleryPage();
  };

  // PhotoListから削除通知を受け取った際のハンドラー (DeletePhotoButton経由)
  const handlePhotoDeleted = async (deletedId: string) => { // async を追加
    // photos ステートから削除された写真をフィルタリングして削除
    setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== deletedId));
    // 全体通知を表示
    setGlobalNotification('写真を削除しました！');
    setTimeout(() => setGlobalNotification(null), 3000); // 3秒後に通知を消す
    console.log(`Photo with ID ${deletedId} has been deleted.`);

    // ★ ギャラリーページのキャッシュを再検証
    await revalidateGalleryPage();
  };

  // PhotoListから並び替え通知を受け取った際のハンドラー
  const handlePhotosReordered = useCallback(async (reorderedPhotos: PhotoType[]) => {
    // UIを即座に更新
    setPhotos(reorderedPhotos);

    // データベースの order 値を更新
    const supabase = createClient();
    // 新しい順序に基づいて order 値を更新
    const updates = reorderedPhotos.map((p, idx) => ({ id: p.id, order: idx }));

    const { error: updateError } = await supabase.from('photos').upsert(updates, { onConflict: 'id' }); // idが衝突したら更新

    if (updateError) {
      console.error('写真の並び替え保存エラー:', updateError);
      setGlobalNotification('写真の並び替えを保存できませんでした: ' + updateError.message);
      setTimeout(() => setGlobalNotification(null), 5000);
    } else {
      setGlobalNotification('写真の並び順を保存しました！');
      setTimeout(() => setGlobalNotification(null), 3000);
    }

    // ★ ギャラリーページのキャッシュを再検証
    await revalidateGalleryPage();
  }, [photos]);


  if (loading) {
    return <p className={styles.loadingText}>写真を読み込み中...</p>;
  }

  if (error) {
    return <p className={styles.errorText}>エラー: {error}</p>;
  }

  return (
    <section className={styles.section}>

      <div className="inner">
        {/* 全体通知の表示 */}
        {globalNotification && (
          <p>{globalNotification}</p>
        )}

        {/* PhotoUploader コンポーネント */}
        <PhotoUploader onPhotoUploaded={handlePhotoUploaded} />

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