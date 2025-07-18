export type PhotoType = {
  id: string;
  url: string; //画像url
  path: string; // R2バケット内のオブジェクトパス
  original_file_name: string; // 元のファイル名
  size: number; // ファイルサイズ (バイト)
  mime_type: string; // MIMEタイプ
  created_at: string;
  order: number;
};