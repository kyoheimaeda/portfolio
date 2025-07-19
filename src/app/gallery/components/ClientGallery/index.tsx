'use client';

import { useState, useRef, useEffect } from 'react';
import PhotoModal from '../PhotoModal';
import PhotoItem from '../PhotoItem';
import styles from "./index.module.scss";
import { GalleryImageType } from '@/features/gallery/types/GalleryImageType';

export default function ClientGallery({
  photos
}: {
  photos: GalleryImageType[]
}) {
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null);
  const originRef = useRef<HTMLElement>(null);

  // 画像プリロード処理
  useEffect(() => {
    photos.forEach((photo) => {
      const img = new Image();
      img.src = photo.url;
    });
  }, [photos]);

  const openPhotoModal = (
    url: string,
    id: string,
    e: React.MouseEvent<HTMLElement>
  ) => {
    const target = e.currentTarget.querySelector('img') as HTMLElement;
    if (!target) return;

    originRef.current = target;
    setSelectedPhotoUrl(url);
    setSelectedPhotoId(id);
  };

  const closePhotoModal = () => {
    setSelectedPhotoUrl(null);
    setSelectedPhotoId(null);
  };

  return (
    <>
      <ul className={styles.photoList}>
        {photos.map((photo) => (
          <PhotoItem // PhotoItem を使用
            key={photo.id}
            photo={photo}
            onClick={(e) => openPhotoModal(photo.url, photo.id, e)}
          />
        ))}
      </ul>

      {selectedPhotoUrl && originRef.current && (
        <PhotoModal
          photoUrl={selectedPhotoUrl}
          photoId={selectedPhotoId}
          isOpen={!!selectedPhotoUrl}
          onClose={closePhotoModal}
          originRef={originRef}
        />
      )}
    </>
  );
}