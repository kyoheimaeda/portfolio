'use client';

import { useState, useRef } from 'react';
import PhotoModal from '../PhotoModal';
import styles from "./index.module.scss";

export default function ClientGallery({ photos }: { photos: any[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const originRef = useRef<HTMLImageElement>(null);

  const openPhotoModal = (url: string, e: React.MouseEvent<HTMLImageElement>) => {
    originRef.current = e.currentTarget;
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
