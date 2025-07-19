'use client';

import { useState, useCallback } from 'react';
import { PhotoType } from '../types/PhotoType';
import { updatePhotoOrderAction, deletePhotoAction } from '../actions';

export const usePhotoManagement = (initialPhotos: PhotoType[] = []) => {
  const [photos, setPhotos] = useState<PhotoType[]>(initialPhotos);
  const [loading] = useState(false); // データはサーバーから渡されるため、初期ローディングは不要
  const [error, setError] = useState<string | null>(null);

  

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

  return { photos, setPhotos, loading, error, updatePhotoOrder, deletePhoto };
};
