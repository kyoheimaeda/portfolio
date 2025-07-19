import PageWrap from '@/components/layout/PageWrap';
import { createClient } from '@/lib/supabaseClient';
import { PhotoType } from '@/features/gallery/types/PhotoType';
import GalleryManager from './components/GalleryManager';

async function getPhotos() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gallery_images')
    .select('*')
    .order('order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching photos:', error);
    // エラーページにリダイレクトするか、エラーメッセージを表示することを検討
    return [];
  }

  return data as PhotoType[];
}

export default async function ManageGalleryPage() {
  const photos = await getPhotos();

  return (
    <PageWrap>
      <GalleryManager initialPhotos={photos} />
    </PageWrap>
  );
}
