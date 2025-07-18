// src/hooks/usePhotoManagement.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { PhotoType } from '@/types/PhotoType';

export const usePhotoManagement = () => {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('gallery_images')
        .select('*')
        // order の値が小さいものから昇順（DB初期値:0）
        .order('order', { ascending: true }) 
         // order が同じ場合はcreated_atが新しいものから降順
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }
      setPhotos(data as PhotoType[]);
    } catch (err: unknown) {
      let errorMessage = '写真の取得に失敗しました。';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const addPhoto = useCallback(async (newPhoto: PhotoType) => {
    try {
      setPhotos(prevPhotos => [...prevPhotos, newPhoto].sort((a, b) => a.order - b.order));
    } catch (err: unknown) {
      let errorMessage = '写真リストの更新に失敗しました。';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // 写真の並び順を更新する関数
  const updatePhotoOrder = useCallback(async (reorderedPhotos: PhotoType[]) => {
    setPhotos(reorderedPhotos); // UIを即座に更新

    try {
      // ★ 修正点: upsert の代わりに、Promise.all と個別の update を使用
      const updatePromises = reorderedPhotos.map(async (p, idx) => {
        const { error: updateError } = await supabase
          .from('gallery_images')
          .update({ order: idx + 1 }) // orderのみを更新
          .eq('id', p.id); // 特定のIDを持つ行を更新

        if (updateError) {
          // 個別の更新でエラーが発生した場合も捕捉
          console.error(`Failed to update photo ${p.id} order:`, updateError);
          throw new Error(updateError.message); // 全体のエラーとしてスロー
        }
      });
      
      await Promise.all(updatePromises); // 全ての更新が完了するのを待つ

      // 並び順の変更はDBに永続化されたが、ここでは特にstateを再設定する必要はない
      // なぜなら setPhotos(reorderedPhotos); ですでにUIは更新されており、
      // データベースの状態と一致しているため
    } catch (err: unknown) {
      let errorMessage = '写真の並び順の更新に失敗しました。';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage); // 親コンポーネントにエラーを伝える
    }
  }, [supabase]);

  const deletePhoto = useCallback(async (photoId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', photoId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
    } catch (err: unknown) {
      let errorMessage = '写真の削除に失敗しました。';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [supabase]);

  return { photos, loading, error, fetchPhotos, addPhoto, updatePhotoOrder, deletePhoto };
};