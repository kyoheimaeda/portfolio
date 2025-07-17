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

// browser-image-compression をインポート
import Compressor from 'browser-image-compression';

// ----------------------------------------
// Types

type PhotoUploaderProps = {
  onUpload: (newPhoto: PhotoType) => void; // プロップス名を onUpload に変更
};

// ----------------------------------------
// Component

export default function PhotoUploader({ onUpload }: PhotoUploaderProps) {
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
      setFile(selectedFile);
      setSelectedFileName(selectedFile.name);

      // プレビュー画像のURLを生成
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl); // 古いURLを解放
      }
      const newPreviewUrl = URL.createObjectURL(selectedFile);
      setPreviewImageUrl(newPreviewUrl);

      setNotification(null); // ファイルが選択されたら通知をクリア
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
    if (!file) {
      setNotification('アップロードするファイルを選択してください。');
      return;
    }

    setUploading(true);
    setNotification('アップロード中...');

    try {
      // 画像圧縮オプション
      const options = {
        maxSizeMB: 1,           // 最大ファイルサイズ (MB)
        maxWidthOrHeight: 1920, // 最大幅または高さ (px)
        useWebWorker: true,     // Web Worker を使用してUIのブロックを避ける
      };

      const compressedFile = await Compressor(file, options);
      console.log('originalFile instanceof Blob', file instanceof Blob); // true
      console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
      console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`);

      const supabase = createClient();

      // ランダムなファイル名に拡張子を追加し、photosフォルダ内に保存
      const fileId = uuidv4();
      const extension = compressedFile.name.substring(compressedFile.name.lastIndexOf('.'));
      const fileName = `photos/${fileId}${extension}`;

      // Supabase Storage にアップロード
      // 'data' は使用しないため、デストラクチャリングから省略
      const { error: uploadError } = await supabase.storage
        .from('images') // バケット名
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false, // 同じファイル名が存在する場合はエラーにする
        });

      if (uploadError) {
        throw uploadError;
      }

      // アップロードされたファイルの公開URLを取得
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error('公開URLの取得に失敗しました。');
      }

      // 新しい写真データをDBに保存
      const { data: photoData, error: dbError } = await supabase
        .from('photos')
        .insert({
          id: fileId,
          url: publicUrlData.publicUrl,
          order: 9999, // 仮の順序。後で管理ページで並び替える
        })
        .select();

      if (dbError) {
        throw dbError;
      }

      // アップロード成功通知を親コンポーネントに送る
      setNotification('アップロードが完了しました！');
      // 新しい写真データを onUpload プロップスを介して親に渡す
      onUpload(photoData[0] as PhotoType);


    } catch (error: unknown) {
      debugger; // ここにdebugger; を追加

      console.error('--- アップロードエラー詳細 ---');
      console.error('エラーオブジェクト全体:', error);
      console.error('エラーの型:', typeof error);
      if (error instanceof Error) {
        console.error('Error インスタンスのメッセージ:', error.message);
        console.error('Error インスタンスの名前:', error.name);
        console.error('Error インスタンスのスタックトレース:', error.stack);
      } else if (typeof error === 'object' && error !== null) {
        // オブジェクトだがErrorインスタンスではない場合、プロパティをJSON形式で表示
        try {
          console.error('エラーオブジェクトのプロパティ:', JSON.stringify(error, null, 2));
        } catch (e) {
          console.error('エラーオブジェクトのプロパティをJSON化できませんでした。');
        }
      }
      console.error('----------------------------');

      let errorMessage = 'アップロードに失敗しました';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'string') {
        errorMessage += `: ${error}`;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
        // オブジェクトに 'message' プロパティがある場合
        errorMessage += `: ${(error as any).message}`;
      } else {
        errorMessage += `。不明なエラー。`;
      }
      setNotification(errorMessage);
    } finally {
      setUploading(false);
      setFile(null);
      setSelectedFileName(null);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
      setTimeout(() => setNotification(null), 3000);
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