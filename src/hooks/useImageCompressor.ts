// src/hooks/useImageCompressor.ts

import Compressor from 'browser-image-compression';

// 圧縮オプションの型定義（必要に応じて拡張可能）
export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  imageType?: string;
  quality?: number;
}

/**
 * 画像圧縮のためのカスタムフック
 * @returns compressImage - 画像を圧縮する非同期関数
 */
export const useImageCompressor = () => {
  /**
   * 画像ファイルを圧縮する非同期関数
   * @param imageFile - 圧縮する元の画像ファイル (File オブジェクト)
   * @param options - 圧縮オプション (例: { maxSizeMB: 1, maxWidthOrHeight: 1920 })
   * @returns 圧縮された File オブジェクトの Promise。圧縮に失敗した場合は元の File オブジェクトを返す。
   */
  const compressImage = async (
    imageFile: File,
    options: CompressionOptions = {
      maxSizeMB: 1,           // 許容する最大ファイルサイズ（MB）
      maxWidthOrHeight: 1920, // 最大幅または最大高（px）
      useWebWorker: true,     // Web Worker を使用するかどうか
    }
  ): Promise<File> => {
    console.log('Original file:', imageFile);
    console.log('Original file size:', (imageFile.size / (1024 * 1024)).toFixed(2), 'MB');

    try {
      // browser-image-compression を使用して画像を圧縮
      const compressedBlob = await Compressor(imageFile, options);

      // Blob オブジェクトを File オブジェクトに変換して返す
      const compressedFile = new File([compressedBlob], imageFile.name, {
        type: compressedBlob.type,
        lastModified: Date.now(), // 最終更新日時を現在に設定
      });

      console.log('Compressed file:', compressedFile);
      console.log('Compressed file size:', (compressedFile.size / (1024 * 1024)).toFixed(2), 'MB');
      return compressedFile;

    } catch (error) {
      console.error('画像圧縮エラー:', error);
      console.warn('画像圧縮に失敗しました。元のファイルで処理を続行します。');
      // 圧縮に失敗した場合は、元のファイルをそのまま返す
      return imageFile;
    }
  };

  return { compressImage };
};