'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export default function PhotoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    // ランダムなファイル名に拡張子を追加
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const fileName = `photos/${uuidv4()}${extension}`;

    // バケットにファイルをアップロード
    const { error: uploadError } = await supabase.storage
      .from('images') // バケット名に注意！
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      alert('アップロードに失敗しました: ' + uploadError.message);
      setUploading(false);
      return;
    }

    // 公開URLを取得
    const { data: publicData, error: urlError } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    if (urlError || !publicData?.publicUrl) {
      alert('公開URLの取得に失敗しました');
      setUploading(false);
      return;
    }

    // DB（photosテーブル）に保存
    const { error: dbError } = await supabase
      .from('photos')
      .insert([{ url: publicData.publicUrl }]);

    if (dbError) {
      console.error('Insert error:', dbError);
      alert('DB登録に失敗しました: ' + dbError.message);
      setUploading(false);
      return;
    }

    alert('アップロード成功！');
    setFile(null);
    setUploading(false);
  };

  return (
    <div style={{ padding: '1rem' }}>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={handleUpload} disabled={!file || uploading}>
        {uploading ? 'アップロード中...' : 'アップロード'}
      </button>
    </div>
  );
}
