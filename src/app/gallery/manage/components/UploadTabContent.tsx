'use client';

import React from 'react';
import PhotoUploader from './PhotoUploader';
import { PhotoType } from '@/features/gallery/types/PhotoType';

type UploadTabContentProps = {
  onPhotoUploaded: (newPhoto: PhotoType) => void;
};

export default function UploadTabContent({ onPhotoUploaded }: UploadTabContentProps) {
  return (
    <PhotoUploader onUpload={onPhotoUploaded} />
  );
}
