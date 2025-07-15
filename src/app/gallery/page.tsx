import { createClient } from '@/lib/supabaseClient';
import ClientGallery from './components/ClientGallery';
import { PhotoType } from '@/types/PhotoType'; // PhotoTypeをインポート

export default async function GalleryPage() {
  const supabase = createClient();
  const { data: photos, error } = await supabase
    .from('photos')
    .select('*')
    // ★ order カラムで昇順にソート。order がない場合は created_at で降順
    .order('order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ギャラリー写真の取得エラー:', error);
    // エラーハンドリング: ユーザーに表示するメッセージやフォールバック
    return <div>写真の読み込み中にエラーが発生しました。</div>;
  }

  return <ClientGallery photos={photos as PhotoType[] || []} />;
}
