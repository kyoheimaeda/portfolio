// src/app/gallery/manage/components/PhotoUploader/index.tsx

'use client';

// ----------------------------------------
// Imports

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { PhotoType } from '@/types/PhotoType';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';

// SCSS モジュールのインポート
import styles from './index.module.scss';

// ★ browser-image-compression をインポート
import Compressor from 'browser-image-compression';

// ----------------------------------------
// Types

type PhotoUploaderProps = {
  onUpload: (newPhoto: PhotoType) => void; // onPhotoUploaded から onUpload に変更
};

// ----------------------------------------
// Component

export default function PhotoUploader({ onUpload }: PhotoUploaderProps) { // プロップス名も変更
  const [file, setFile] = useState<File | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // プレビューURLのクリーンアップ
  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 153:18 のエラー ('e' is defined but never used.) への対処
    // e.target.files を使用しているにもかかわらず発生する場合、linterに明示的に'e'が使用されていることを伝える
    void e; 

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setSelectedFileName(selectedFile.name);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      setPreviewImageUrl(URL.createObjectURL(selectedFile));
      setNotification(null); // ファイルが変更されたら通知をクリア
    } else {
      setFile(null);
      setSelectedFileName(null);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setNotification(null);

    const supabase = createClient();

    try {
      // 圧縮オプション
      const options = {
        maxSizeMB: 1,           // 最大ファイルサイズ (MB)
        maxWidthOrHeight: 1920, // 最大幅または高さ
        use         : 'webworker' as const,  // Web Worker を使用
        // fileType: 'image/jpeg', // 出力ファイルタイプ
        // quality: 0.9,           // 画質
      };

      const compressedFile = await Compressor(file, options);

      const fileName = `${uuidv4()}-${compressedFile.name}`;
      // Supabaseバケット名とフォルダ名を指定
      // バケット名「images」、フォルダ「photos」
      const storagePath = `photos/${fileName}`;

      
      const { error: uploadError } = await supabase.storage // data を destructuring から完全に削除
        .from('images') // バケット名を 'images' に修正
        .upload(storagePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError; // エラーを次のcatchブロックへ
      }

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(storagePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('Public URL の取得に失敗しました。');
      }

      // DBに画像情報を保存
      const { data: dbData, error: dbError } = await supabase
        .from('photos')
        .insert({ url: publicUrlData.publicUrl })
        .select()
        .single();

      if (dbError) {
        throw dbError; // エラーを次のcatchブロックへ
      }

      setNotification('アップロード成功！');
      onUpload(dbData as PhotoType); // 親コンポーネントに新しい写真情報を渡す
      setFile(null);
      setSelectedFileName(null);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
    } catch (error: unknown) { // 'unknown' type は正しい
      console.error('--- アップロードエラー詳細 ---');

      // 164:104, 166:40 のエラー (Unexpected any. Specify a different type.) への対処
      // `error: unknown` 型から安全に情報を取得し、`any` の推論を避ける
      let errorMessage = '不明なエラーが発生しました。';
      let errorDetails: string = '';

      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = JSON.stringify({
          name: error.name,
          message: error.message,
          stack: error.stack
        }, null, 2);
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        // Error インスタンスではないが、message プロパティを持つオブジェクトの場合
        errorMessage = (error as { message: string }).message;
        errorDetails = JSON.stringify(error, null, 2);
      } else {
        // その他のプリミティブ型や予期しない構造の場合
        errorMessage = String(error);
        errorDetails = String(error);
      }

      console.error('Error type:', typeof error); // この行は 'unknown' で問題ないはずです
      console.error('Error message:', errorMessage); // 処理されたエラーメッセージを使用
      console.error('Error object details:', errorDetails); // 処理されたエラー詳細を使用

      setNotification(`アップロードに失敗しました: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  };

  const isErrorNotification = notification && (notification.includes('失敗') || notification.includes('エラー'));
  const notificationClass = isErrorNotification ? styles.notificationError : styles.notificationSuccess;

  return (
    <section className={styles.section}>
      <div className={styles.inputArea}>
        <h2>写真をアップロード</h2>
        {notification && (
          <p className={`${styles.notification} ${notificationClass}`}>
            {notification}
          </p>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className={styles.fileInput}
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className={styles.uploadButton}
        >
          {uploading ? 'アップロード中...' : 'アップロード'}
        </button>
      </div>

      <div className={styles.previewArea}>
        <div className={styles.imagePreview}>
          {previewImageUrl ? (
            <Image
              src={previewImageUrl}
              alt="選択された画像のプレビュー"
              width={300}
              height={200}
              layout="responsive"
              objectFit="contain"
            />
          ) : (
            selectedFileName ? (
              <p className={styles.fileName}>{selectedFileName}</p>
            ) : (
              <p className={styles.noImageText}>画像が選択されていません。</p>
            )
          )}
        </div>
      </div>
    </section>
  );
}