'use client';

import { useState, useRef } from 'react';
import PhotoModal from '../PhotoModal';
import styles from "./index.module.scss";

type Photo = {
  id: string;
  url: string;
  created_at: string;
};

export default function ClientGallery({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const originRef = useRef<HTMLElement>(null); // ★ 型を統一

  const openPhotoModal = (url: string, e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget.querySelector('img') as HTMLElement;
    if (!target) return;

    originRef.current = target;
    setSelectedPhoto(url);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  return (
    <section className={styles.section}>
      <div className="inner">
        <h1 className={styles.title}>GALLERY</h1>
        <ul className={styles.photoList}>
          {photos.map((photo) => (
            <li key={photo.id} onClick={(e) => openPhotoModal(photo.url, e)}>
              <a>
                <img
                  src={photo.url}
                  alt="uploaded"
                />
              </a>
            </li>
          ))}
        </ul>
        {selectedPhoto && originRef.current && (
          <PhotoModal
            photoUrl={selectedPhoto}
            isOpen={!!selectedPhoto}
            onClose={closePhotoModal}
            originRef={originRef}
          />
        )}
      </div>
    </section>
  );
}
