'use client';

import { useState, useRef } from 'react';
import PhotoModal from '../PhotoModal';
import styles from "./index.module.scss";
import { PhotoType } from '@/types/PhotoType';
import Image from 'next/image';

export default function ClientGallery({
  photos
}: {
  photos: PhotoType[] 
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const originRef = useRef<HTMLElement>(null);
  
  const openPhotoModal = (
    url: string,
    e: React.MouseEvent<HTMLElement>
  ) => {
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
              <a className={styles.link}> {/* a タグにスタイルクラスを追加して position: absolute; を適用 */}
                {/* <img> タグを <Image /> コンポーネントに置き換え */}
                <Image
                  src={photo.url}
                  alt={'image'}
                  fill // 親要素 (a タグ) のサイズを埋める
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // レスポンシブな画像サイズを定義
                  style={{
                    objectFit: 'contain', // 画像をアスペクト比を維持して親要素に収める
                    objectPosition: 'center', // 画像を中央に配置
                  }}
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