'use client';

// ----------------------------------------
// Imports

import { useState, useEffect } from 'react';
import { PhotoType } from '@/features/gallery/types/PhotoType';
import Image from 'next/image';
import Compressor from 'browser-image-compression';
import { uploadPhotoAction } from '@/features/gallery/actions';
import { LuImageUp } from "react-icons/lu";
import styles from './index.module.scss';
import Dialog from '@/components/ui/Dialog'; // Dialog をインポート
import { motion, AnimatePresence } from 'motion/react';

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
  const [fileSize, setFileSize] = useState<number | null>(null); // ファイルサイズを追加
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // 確認モーダルの表示状態

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
      setFileSize(selectedFile.size); // ファイルサイズを設定

      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      setPreviewImageUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setSelectedFileName(null);
      setFileSize(null); // ファイルサイズをクリア
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
    }
    setNotification(null);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // 確認モーダルを表示するハンドラ
  const handleConfirmUploadClick = () => {
    if (file) {
      setShowConfirmModal(true);
    } else {
      setNotification('ファイルが選択されていません。');
    }
  };

  // モーダル内の「アップロード」ボタンが押された時のハンドラ
  const handleModalUploadConfirm = async () => {
    setShowConfirmModal(false); // モーダルを閉じる
    await handleUpload(); // 実際のアップロード処理を実行
  };

  // モーダル内の「キャンセル」ボタンが押された時のハンドラ
  const handleModalCancel = () => {
    setShowConfirmModal(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setNotification('ファイルが選択されていません。');
      return;
    }

    setUploading(true);
    setNotification('画像をアップロード中...');

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await Compressor(file, options);

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('original_file_name', file.name);

      const result = await uploadPhotoAction(formData);

      if (!result.success || !result.newPhoto) {
        throw new Error(result.error || 'アップロードに失敗しました。');
      }

      onUpload(result.newPhoto);

      setNotification('画像が正常にアップロードされました！');
      setFile(null);
      setSelectedFileName(null);
      setFileSize(null); // アップロード後もクリア
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      setNotification(`画像のアップロード中にエラーが発生しました: ${errorMessage}`);
      console.error('Upload error:', error);
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
        {notification && (
          <p className={`${styles.notification} ${notificationClass}`}>
            {notification}
          </p>
        )}
        
        <div className={styles.uploadArea}>
          <div className={styles.input}>
            <div className={styles.inputFile}>
              <div className={styles.inputText}>
                <LuImageUp strokeWidth={1} />
                <p>画像を選択・アップロード</p>
                <button className={`c-button ${styles.inputButton}`}>Browse File</button>
              </div>
              <input
                id='fileInput'
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
          </div>

          {file && (
            <div className={styles.preview}>
              <div className={styles.previewImage}>
                {previewImageUrl ? (
                  <figure>
                    <Image
                      src={previewImageUrl}
                      alt="選択された画像のプレビュー"
                      fill
                    />
                  </figure>
                ) : (
                  <p className={styles.noImageText}>画像プレビュー</p>
                )}
              </div>
              <div className={styles.fileInfo}>
                <p>ファイル名: {selectedFileName}</p>
                <p>サイズ: {fileSize !== null ? formatBytes(fileSize) : 'N/A'}</p>
              </div>
            </div>
          )}

          <AnimatePresence>
            {file && (
              <motion.div
                className={`${styles.uploadButtonWrap}`}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <button
                  onClick={handleConfirmUploadClick}
                  disabled={!file || uploading}
                  className={`c-button ${styles.uploadButton}`}
                >
                  {uploading ? 'アップロード中...' : 'アップロードする'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 確認モーダル */}
      <Dialog
        isOpen={showConfirmModal}
        onClose={handleModalCancel}
        onConfirm={handleModalUploadConfirm}
        title="アップロードの確認"
        message={(
          <>
            <p>以下の画像をアップロードしますか？</p>
            <div className={styles.confirmImagePreview}>
              {previewImageUrl && (
                <Image
                  src={previewImageUrl}
                  alt="確認プレビュー"
                  fill
                  objectFit="contain"
                />
              )}
            </div>
            <p>ファイル名: {selectedFileName}</p>
            <p>サイズ: {fileSize !== null ? formatBytes(fileSize) : 'N/A'}</p>
          </>
        )}
        confirmText="アップロード"
        cancelText="キャンセル"
        isProcessing={uploading}
      />
    </section>
  );
}