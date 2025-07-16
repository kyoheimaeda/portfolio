import { createClient } from '@/lib/supabaseClient';
import ClientGallery from './components/ClientGallery';
import { PhotoType } from '@/types/PhotoType'; // PhotoTypeをインポート

// ISR の設定
// このページは最大3600秒（1時間）キャッシュされ、
// その後新しいリクエストがあった際にバックグラウンドで再生成されます。
// また、明示的に再検証（revalidate）された場合も更新されます。
export const revalidate = 3600; // ここを適切な秒数に設定してください (例: 1時間 = 3600秒, 1日 = 86400秒)

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