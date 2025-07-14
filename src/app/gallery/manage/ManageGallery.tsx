'use client';

import { useState } from 'react';
import PhotoUploader from '../components/PhotoUploader';
import PhotoManager from '../components/PhotoManager';

export default function ManageGallery({ photos }: { photos: any[] }) {
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
