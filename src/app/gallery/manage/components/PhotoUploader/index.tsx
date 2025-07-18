// src/app/gallery/manage/components/PhotoUploader/index.tsx

'use client';

// ----------------------------------------
// Imports

import { useState, useEffect } from 'react';
// import { createClient } from '@/lib/supabaseClient'; // この行は既に削除済みのはずです
import { v4 as uuidv4 } from 'uuid';
import { PhotoType } from '@/types/PhotoType';
import Image from 'next/image'; // next/image をインポート

// SCSS モジュールのインポート
import styles from './index.module.scss';

// browser-image-compression をインポート
import Compressor from 'browser-image-compression';

// ----------------------------------------
// Types

type PhotoUploaderProps = {
  onUpload: (newPhoto: PhotoType) => void;
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

      // プレビュー表示のためのURLを生成
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl); // 既存のURLを解放
      }
      setPreviewImageUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setSelectedFileName(null);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
    }
    setNotification(null); // ファイル変更時に通知をクリア
  };

  const handleUpload = async () => {
    if (!file) {
      setNotification('ファイルが選択されていません。');
      return;
    }

    setUploading(true);
    setNotification('画像をアップロード中...');

    try {
      // 以前私がここにデバッグ用のconsole.logを挿入しましたが、
      // クライアントサイドからはサーバーサイドの環境変数は見えないため、
      // 誤解を招くので、このブロックは完全に削除します。
      // APIルート（src/app/api/upload-image/route.ts）内で確認してください。

      // R2関連の環境変数の確認
      // このチェックはAPIルートで行われるべきです。
      // クライアントサイドでは、Next.jsが自動的にNEXT_PUBLIC_が付かない変数を隠蔽します。
      // ここでの明示的なチェックは不要です。

      // 画像圧縮オプション
      const options = {
        maxSizeMB: 1,           // 最大ファイルサイズ（MB）
        maxWidthOrHeight: 1920, // 最大幅または高さ（ピクセル）
        useWebWorker: true,    // WebWorker を使用して高速化
      };

      const compressedFile = await Compressor(file, options);

      const fileName = `${uuidv4()}-${file.name.replace(/\s/g, '_')}`; // ファイル名にUUIDを付与し、スペースをアンダースコアに置換
      const filePath = `images/gallery/${fileName}`; // R2 に保存するパス

      const formData = new FormData();
      formData.append('file', compressedFile); // 圧縮後のファイルをFormDataに追加
      formData.append('filePath', filePath); // R2に保存するパス
      formData.append('original_file_name', file.name); // 元のファイル名
      formData.append('compressed_size_kb', (compressedFile.size / 1024).toFixed(2)); // 圧縮後のサイズ

      // APIルートにアップロードリクエストを送信
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'アップロードに失敗しました。');
      }

      const result = await response.json();
      const newPhoto: PhotoType = result.newPhoto; // APIからPhotoTypeとして返されると仮定

      onUpload(newPhoto); // 親コンポーネントにアップロード成功を通知

      setNotification('画像が正常にアップロードされました！');
      setFile(null);
      setSelectedFileName(null);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }

    } catch (error: unknown) {
      console.error('画像のアップロード中にエラーが発生しました:', error);
      let errorMessage = '不明なエラー';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        if (typeof (error as { message: unknown }).message === 'string') {
          errorMessage = (error as { message: string }).message;
        }
      } else {
        errorMessage = String(error); // Errorインスタンスでもオブジェクトでもない場合は文字列化
      }
      setNotification(`画像のアップロード中にエラーが発生しました: ${errorMessage}`);
    } finally {
      setUploading(false);
      setTimeout(() => setNotification(null), 5000);
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