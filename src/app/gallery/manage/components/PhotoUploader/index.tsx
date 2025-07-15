'use client';

// ----------------------------------------
// Imports

import { useState, useEffect } from 'react'; // useEffect を追加
import { createClient } from '@/lib/supabaseClient';
import { PhotoType } from '@/types/PhotoType';
import { v4 as uuidv4 } from 'uuid';

// SCSS モジュールのインポート
import styles from './index.module.scss'; // ★ SCSSモジュールをインポート

// ----------------------------------------
// Types

type PhotoUploaderProps = {
  onPhotoUploaded: (newPhoto: PhotoType) => void; // 新しい写真がアップロードされた時に呼び出すコールバック
};

// ----------------------------------------
// Component

export default function PhotoUploader({ onPhotoUploaded }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null); // 選択された画像のプレビューURL

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
      setNotification(null); // ファイル選択時に通知をクリア

      // 画像ファイルの場合のみプレビューを生成
      if (selectedFile.type.startsWith('image/')) {
        if (previewImageUrl) {
          URL.revokeObjectURL(previewImageUrl); // 既存のプレビューURLを解放
        }
        setPreviewImageUrl(URL.createObjectURL(selectedFile));
      } else {
        if (previewImageUrl) {
          URL.revokeObjectURL(previewImageUrl);
        }
        setPreviewImageUrl(null); // 画像でない場合はプレビューをクリア
      }
    } else {
      setFile(null);
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

    const supabase = createClient(); // createClient を呼び出して Supabase クライアントを取得

    // ランダムなファイル名に拡張子を追加し、photosフォルダ内に保存
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    const fileNameInBucket = `photos/${uuidv4()}${extension}`; // バケット内のパス

    try {
      // Supabase Storage にファイルをアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images') // ★ ここをあなたのバケット名に合わせてください (例: 'images' または 'photos')
        .upload(fileNameInBucket, file, {
          cacheControl: '3600', // キャッシュ制御
          upsert: false, // 同じファイル名が存在する場合に上書きしない
        });

      if (uploadError) {
        console.error('Supabase Storage アップロードエラー:', uploadError);
        setNotification(`アップロードに失敗しました: ${uploadError.message}`);
        setTimeout(() => setNotification(null), 5000);
        return; // エラーが発生したらここで処理を終了
      }

      console.log('ファイルアップロード成功:', uploadData);

      // アップロードされたファイルの公開URLを取得
      const { data: publicUrlData } = supabase.storage
        .from('images') // ★ ここもあなたのバケット名に合わせてください
        .getPublicUrl(fileNameInBucket);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error('公開URLの取得に失敗しました:', publicUrlData);
        setNotification('公開URLの取得に失敗しました。');
        // ストレージにアップロード済みのファイルを削除するロジックをここに追加しても良い
        await supabase.storage.from('images').remove([fileNameInBucket]); // 失敗したら削除
        setTimeout(() => setNotification(null), 5000);
        return; // エラーが発生したらここで処理を終了
      }

      const photoUrl = publicUrlData.publicUrl;
      console.log('公開URL:', photoUrl);

      // DBに写真情報を保存
      // created_at は Supabase のデフォルト値で自動設定されることを想定しています。
      const { data: insertedPhoto, error: dbError } = await supabase.from('photos') // ★ DBテーブル名が 'photos' であることを確認
        .insert({ url: photoUrl })
        .select('*') // 挿入されたレコードの全カラムを取得
        .single(); // 1つのレコードが挿入されることを期待

      if (dbError) {
        console.error('Supabase DB挿入エラー:', dbError);
        setNotification(`DBへの保存に失敗しました: ${dbError.message}`);
        // DB挿入に失敗した場合、ストレージにアップロード済みのファイルを削除する
        await supabase.storage.from('images').remove([fileNameInBucket]);
        setTimeout(() => setNotification(null), 5000);
        return; // エラーが発生したらここで処理を終了
      }

      console.log('DB挿入成功:', insertedPhoto);
      setNotification('アップロード成功！');
      onPhotoUploaded(insertedPhoto as PhotoType); // 新しい写真を親に通知
      setFile(null); // ファイル選択をリセット
      if (previewImageUrl) { // プレビューURLも解放してリセット
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
      setTimeout(() => setNotification(null), 3000);

    } catch (err: any) {
      console.error('予期せぬエラーが発生しました:', err);
      setNotification(`予期せぬエラーが発生しました: ${err.message}`);
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setUploading(false); // 処理の成功・失敗に関わらずアップロード状態を解除
    }
  };

  const isErrorNotification = notification && (notification.includes('失敗') || notification.includes('エラー'));
  const notificationClass = isErrorNotification ? styles.notificationError : styles.notificationSuccess;

  return (
    <section className={styles.section}>
      <div className={styles.inputArea}>
        <h2>Upload Image</h2>
        {notification && (
          <p className={`${styles.notification} ${notificationClass}`}> {/* ★ ここを修正 */}
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

      {/* 選択されたファイル名とプレビューの表示 */}
      <div className={styles.previewArea}>
        <div className={styles.imagePreview}>
          {previewImageUrl && (
            <img src={previewImageUrl} alt="選択された画像のプレビュー" />
          )}
        </div>
      </div>
    </section>
  );
}
