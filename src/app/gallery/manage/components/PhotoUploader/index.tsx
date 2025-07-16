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
  onPhotoUploaded: (newPhoto: PhotoType) => void;
};

// ----------------------------------------
// Component

export default function PhotoUploader({ onPhotoUploaded }: PhotoUploaderProps) {
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
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      // ファイルタイプをチェック
      if (!selectedFile.type.startsWith('image/')) {
        setNotification('画像ファイルを選択してください。');
        setTimeout(() => setNotification(null), 3000);
        setFile(null);
        setSelectedFileName(null);
        if (previewImageUrl) {
          URL.revokeObjectURL(previewImageUrl);
        }
        setPreviewImageUrl(null);
        return;
      }

      setFile(selectedFile);
      setNotification(null);
      setSelectedFileName(selectedFile.name);

      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      setPreviewImageUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setSelectedFileName(null);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      setPreviewImageUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setNotification('ファイルを選んでください。');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setUploading(true);
    setNotification('アップロード中...');

    const supabase = createClient();

    let fileToUpload: File = file; // アップロードするファイルを初期化

    try {
      // ----------------------------------------------------
      // ★ ここから画像圧縮処理を追加 ★
      // ----------------------------------------------------
      console.log('Original file:', file);
      console.log('Original file size:', (file.size / (1024 * 1024)).toFixed(2), 'MB');

      const compressionOptions = {
        maxSizeMB: 1,           // 許容する最大ファイルサイズ（MB）。これを超えると圧縮される
        maxWidthOrHeight: 1920, // 最大幅または最大高。どちらか大きい方がこの値を超える場合にリサイズ
        useWebWorker: true,     // Web Worker を使用して圧縮をバックグラウンドで行う（パフォーマンス向上）
        // imageType: 'image/jpeg', // 出力する画像形式を指定 (省略すると元の形式が維持される)
        // quality: 0.8, // 圧縮品質 (0〜1、jpeg/webpのみ有効)。maxSizeMB と併用すると、maxSizeMB が優先されることが多い
      };

      try {
        const compressedBlob = await Compressor(file, compressionOptions);
        // compressedBlob は Blob オブジェクトなので、File オブジェクトに変換
        fileToUpload = new File([compressedBlob], file.name, { type: compressedBlob.type });

        console.log('Compressed file:', fileToUpload);
        console.log('Compressed file size:', (fileToUpload.size / (1024 * 1024)).toFixed(2), 'MB');
      } catch (compressionError) {
        console.error('画像圧縮エラー:', compressionError);
        console.warn('画像圧縮に失敗しました。元のファイルでアップロードを試みます。');
        // 圧縮に失敗しても、元のファイル (fileToUpload はそのまま file の値) でアップロードを試行する
      }
      // ----------------------------------------------------
      // ★ ここまで画像圧縮処理を追加 ★
      // ----------------------------------------------------


      // ランダムなファイル名に拡張子を追加し、photosフォルダ内に保存
      const extension = fileToUpload.name.substring(fileToUpload.name.lastIndexOf('.'));
      const fileNameInBucket = `photos/${uuidv4()}${extension}`; // バケット内のパス

      // Supabase Storage に画像をアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images') // ★ ここをあなたのバケット名に合わせてください (例: 'images' または 'photos')
        .upload(fileNameInBucket, fileToUpload, { // 圧縮されたファイルを使用
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Supabase Storage アップロードエラー:', uploadError);
        setNotification(`アップロードに失敗しました: ${uploadError.message}`);
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      console.log('ファイルアップロード成功:', uploadData);

      // アップロードされたファイルの公開URLを取得
      const { data: publicUrlData } = supabase.storage
        .from('images') // ★ ここもあなたのバケット名に合わせてください
        .getPublicUrl(fileNameInBucket);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('公開URLの取得に失敗しました:', publicUrlData);
        setNotification('公開URLの取得に失敗しました。');
        await supabase.storage.from('images').remove([fileNameInBucket]);
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      const photoUrl = publicUrlData.publicUrl;
      console.log('公開URL:', photoUrl);

      // DBに写真情報を保存
      const { data: insertedPhoto, error: dbError } = await supabase.from('photos')
        .insert({ url: photoUrl })
        .select('*')
        .single();

      if (dbError) {
        console.error('Supabase DB挿入エラー:', dbError);
        setNotification(`DBへの保存に失敗しました: ${dbError.message}`);
        await supabase.storage.from('images').remove([fileNameInBucket]);
        setTimeout(() => setNotification(null), 5000);
        return;
      }

      console.log('DB挿入成功:', insertedPhoto);
      setNotification('アップロード成功！');
      onPhotoUploaded(insertedPhoto as PhotoType);
      setFile(null);
      setSelectedFileName(null);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
      setTimeout(() => setNotification(null), 3000);

    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('予期せぬエラーが発生しました:', err);
        setNotification(`予期せぬエラーが発生しました: ${err.message}`);
      } else {
        console.error('予期せぬエラーが発生しました:', err);
        setNotification('予期せぬエラーが発生しました。');
      }
      setTimeout(() => setNotification(null), 5000);
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