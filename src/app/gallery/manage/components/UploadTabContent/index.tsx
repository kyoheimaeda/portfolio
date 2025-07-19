'use client';

import React from 'react';
import PhotoUploader from '../PhotoUploader';
import { GalleryImageType } from '@/features/gallery/types/GalleryImageType';

type UploadTabContentProps = {
  onPhotoUploaded: (newPhoto: GalleryImageType) => void;
};

export default function UploadTabContent({ onPhotoUploaded }: UploadTabContentProps) {
  return (
    <PhotoUploader onUpload={onPhotoUploaded} />
  );
}
