'use client';

import { createClient } from '@/lib/supabaseClient';

export default function PhotoManager({ photos }: { photos: any[] }) {
  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('photos').delete().eq('id', id);
    if (error) {
      alert('Delete failed');
    } else {
      alert('Deleted successfully');
    }
  };

  return (
    <div>
      {photos.map((photo) => (
        <div key={photo.id}>
          <img src={photo.url} alt="thumbnail" width={100} />
          <button onClick={() => handleDelete(photo.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
