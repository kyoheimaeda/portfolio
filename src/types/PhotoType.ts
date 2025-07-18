export type PhotoType = {
  id: string;
  url: string;
  path: string; // ★ 追加: R2バケット内のオブジェクトパス
  original_file_name: string; // ★ 追加: 元のファイル名
  size: number; // ★ 追加: ファイルサイズ (バイト)
  mime_type: string; // ★ 追加: MIMEタイプ
  created_at: string;
  order: number;
};