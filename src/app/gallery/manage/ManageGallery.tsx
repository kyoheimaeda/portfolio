'use client';

import { useState } from 'react';
import PhotoUploader from '../components/PhotoUploader';
import PhotoManager from '../components/PhotoManager';

type Photo = {
  id: string;
  url: string;
  created_at: string;
};

export default function ManageGallery({ photos }: { photos: Photo[] }) {
  const [view, setView] = useState<'upload' | 'manage'>('upload');

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setView('upload')}>Upload</button>
        <button onClick={() => setView('manage')}>Manage</button>
      </div>
      {view === 'upload' && <PhotoUploader />}
      {view === 'manage' && <PhotoManager photos={photos} />}
    </div>
  );
}
