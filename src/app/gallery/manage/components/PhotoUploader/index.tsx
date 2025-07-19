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
import Dialog from '@/components/ui/Dialog';
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
  const [uploading, setUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // エラーメッセージ用ステート
  const [showErrorDialog, setShowErrorDialog] = useState(false); // エラーダイアログ表示用ステート

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
      setFileSize(selectedFile.size);

      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
      setPreviewImageUrl(URL.createObjectURL(selectedFile));
    } else {
      setFile(null);
      setSelectedFileName(null);
      setFileSize(null);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleConfirmUploadClick = () => {
    if (file) {
      setShowConfirmModal(true);
    } else {
      setErrorMessage('ファイルが選択されていません。');
      setShowErrorDialog(true);
    }
  };

  const handleModalUploadConfirm = async () => {
    setShowConfirmModal(false);
    await handleUpload();
  };

  const handleModalCancel = () => {
    setShowConfirmModal(false);
  };

  const handleErrorDialogClose = () => {
    setErrorMessage(null);
    setShowErrorDialog(false);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('ファイルが選択されていません。');
      setShowErrorDialog(true);
      return;
    }

    setUploading(true);

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

      setFile(null);
      setSelectedFileName(null);
      setFileSize(null);
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
        setPreviewImageUrl(null);
      }

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '不明なエラーが発生しました。';
      setErrorMessage(`画像のアップロード中にエラーが発生しました: ${msg}`);
      setShowErrorDialog(true);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.inputArea}>
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

      {/* エラー表示用ダイアログ */}
      <Dialog
        isOpen={showErrorDialog}
        onClose={handleErrorDialogClose}
        title="エラー"
        message={errorMessage}
        confirmText="閉じる"
      />
    </section>
  );
}