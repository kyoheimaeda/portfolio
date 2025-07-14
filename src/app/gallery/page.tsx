import { createClient } from '@/lib/supabaseClient';
import ClientGallery from './components/ClientGallery';

export default async function GalleryPage() {
  const supabase = createClient();
  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false });

  return <ClientGallery photos={photos || []} />;
}
