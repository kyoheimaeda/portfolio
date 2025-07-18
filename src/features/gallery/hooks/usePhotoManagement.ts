'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { PhotoType } from '../types/PhotoType';
import { updatePhotoOrderAction, deletePhotoAction } from '../actions';

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
        .order('order', { ascending: true })
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

  const updatePhotoOrder = useCallback(async (reorderedPhotos: PhotoType[]) => {
    try {
      const result = await updatePhotoOrderAction(reorderedPhotos);

      if (!result.success) {
        console.error('usePhotoManagement: updatePhotoOrderAction failed:', result.error);
        throw new Error(result.error);
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '写真の並び順の更新に失敗しました。';
      setError(errorMessage);
      console.error('usePhotoManagement: updatePhotoOrder error:', err);
      throw new Error(errorMessage);
    }
  }, []);

  const deletePhoto = useCallback(async (photo: PhotoType) => {
    try {
      const result = await deletePhotoAction(photo);

      if (!result.success) {
        throw new Error(result.error);
      }

      setPhotos(prevPhotos => prevPhotos.filter(p => p.id !== photo.id));

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '写真の削除に失敗しました。';
      setError(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  return { photos, setPhotos, loading, error, fetchPhotos, updatePhotoOrder, deletePhoto };
};
