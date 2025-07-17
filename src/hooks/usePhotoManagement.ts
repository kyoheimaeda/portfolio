// src/hooks/usePhotoManagement.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { PhotoType } from '@/types/PhotoType';

export const usePhotoManagement = () => {
  const [photos, setPhotos] = useState<PhotoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // SupabaseクライアントをuseMemoでメモ化し、コンポーネントの再レンダリング時に再生成されないようにする
  // これにより、supabaseオブジェクトがレンダリングごとに新しくなることを防ぎ、useCallbackの依存配列の安定性を保つ
  const supabase = useMemo(() => createClient(), []);

  // 写真データをフェッチする関数
  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('photos')
        .select('*')
        .order('order', { ascending: true })
        .order('created_at', { ascending: false }); // orderが同じ場合はcreated_atで並び替える

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

  // 初回ロード時に写真をフェッチ
  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // 写真を追加する関数
  // この関数は、外部（PhotoUploader）で既にDBに挿入された新しい写真オブジェクトを受け取り、
  // usePhotoManagement の内部状態 `photos` を更新するために使用します。
  const addPhoto = useCallback(async (newPhoto: PhotoType) => { // newPhoto は PhotoType 全体を受け取る
    try {
      // PhotoUploaderで既にDBに挿入されているため、ここではDB操作は行いません。
      // 単に内部state (`photos`) を更新するのみです。
      setPhotos(prevPhotos => [...prevPhotos, newPhoto].sort((a, b) => a.order - b.order));
    } catch (err: unknown) {
      // ここでのエラーはstate更新自体が失敗することは稀ですが、念のためハンドリング
      let errorMessage = '写真リストの更新に失敗しました。';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage); // 親コンポーネントにエラーを伝える
    }
  }, []); // supabase への依存は不要になりました

  // 写真の並び順を更新する関数
  const updatePhotoOrder = useCallback(async (reorderedPhotos: PhotoType[]) => {
    setPhotos(reorderedPhotos); // UIを即座に更新

    try {
      // SupabaseのupdateにはIDとorderのみを渡す
      const updates = reorderedPhotos.map((p, idx) => ({ id: p.id, order: idx + 1 }));
      const { error: updateError } = await supabase
        .from('photos')
        .upsert(updates, { onConflict: 'id' });

      if (updateError) {
        throw new Error(updateError.message);
      }
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
  }, [supabase]); // supabaseは安定

  // 写真を削除する関数
  const deletePhoto = useCallback(async (photoId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (deleteError) {
        throw new Error(deleteError.message);
      }
      // 削除された写真を除外してstateを更新
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
    } catch (err: unknown) {
      let errorMessage = '写真の削除に失敗しました。';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      throw new Error(errorMessage); // 親コンポーネントにエラーを伝える
    }
  }, [supabase]); // supabaseは安定

  return { photos, loading, error, fetchPhotos, addPhoto, updatePhotoOrder, deletePhoto };
};