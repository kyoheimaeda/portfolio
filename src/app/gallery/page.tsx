import { PhotoType } from '@/types/PhotoType';
import { createClient } from '@/lib/supabaseClient';
import ClientGallery from './components/ClientGallery';
import PageWrap from '@/components/layout/PageWrap';
// import styles from "./page.module.scss";

// ISR の設定を false に変更
// これにより、自動的な時間経過による再検証は行われず、
// 明示的な revalidatePath('/gallery') が呼び出された時のみ
// キャッシュが再検証され、ページが再生成される
export const revalidate = false; // または 0;

export default async function GalleryPage() {
  const supabase = createClient();
  const { data: photos, error } = await supabase
    .from('gallery_images')
    .select('*')
    .order('order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ギャラリー写真の取得エラー:', error);
    return <div>写真の読み込み中にエラーが発生しました。</div>;
  }

  return (
    <PageWrap title='GALLERY'>
      <ClientGallery photos={photos as PhotoType[] || []} />
    </PageWrap>
  );
}