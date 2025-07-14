import { createClient } from '@/lib/supabaseClient';
import ManageGallery from './ManageGallery';

export default async function ManageGalleryPage() {
  const supabase = createClient();
  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false });

  return <ManageGallery photos={photos || []} />;
}
