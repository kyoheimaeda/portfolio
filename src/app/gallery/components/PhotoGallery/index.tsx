import { createClient } from '@/lib/supabaseClient';

export default async function GalleryPage() {
  const { data: photos } = await createClient()
    .from('photos')  // ここはDBテーブル名。imagesはバケット名なので関係ありません
    .select('url')
    .order('created_at', { ascending: false });

  return (
    <div>
      {photos?.map((photo, idx) => (
        <img
          key={idx}
          src={`${photo.url}?v=${new Date(photo.created_at).getTime()}`}
          alt="Uploaded"
          width={300}
        />
      ))}
    </div>
  );
}
