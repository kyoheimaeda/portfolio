// src/app/api/delete-image/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@/lib/supabaseClient';

// R2の認証情報を環境変数から取得
// ESLintのno-unused-varsは、exportされていないトップレベル変数を誤検知することがあります。
// 実際のコードではこれらの変数はs3Clientの初期化やPOST関数内で使用されています。
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME; // web-app-assets

// 環境変数が設定されているか確認 (早期リターンでエラーを防ぐ)
if (!CLOUDFLARE_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error("Missing Cloudflare R2 environment variables for delete-image API.");
  // このモジュールがインポートされる際にエラーにするか、API呼び出し時にエラーを返すかは設計による
  // ここではAPI呼び出し時にエラーを返す前提とする
}

// R2のS3互換エンドポイントURL
const R2_ENDPOINT_URL = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// S3クライアントの初期化
const s3Client = new S3Client({
  region: 'auto', // Cloudflare R2 は 'auto' でOK
  endpoint: R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

// Supabase DBクライアント
const supabase = createClient();

export async function POST(req: NextRequest) { // 'req' は req.json() で使用されるため、no-unused-varsの誤検知です
  try {
    const { id, path } = await req.json(); // フロントエンドから画像IDとR2パスを受け取る

    if (!id || !path) {
      return NextResponse.json({ message: 'Image ID and path are required.' }, { status: 400 });
    }

    // 1. R2から画像を削除
    const deleteCommand = new DeleteObjectCommand({ // 'DeleteObjectCommand' はここで使用されています
      Bucket: R2_BUCKET_NAME, // 'R2_BUCKET_NAME' はここで使用されています
      Key: path, // R2のオブジェクトキー（例: images/gallery/xxxx-xxxx.webp）
    });
    await s3Client.send(deleteCommand); // 's3Client' はここで使用されています

    // 2. Supabaseデータベースからレコードを削除
    const { error: dbError } = await supabase // 'supabase' はここで使用されています
      .from('gallery_images') // テーブル名
      .delete()
      .eq('id', id); // IDでレコードを特定して削除

    if (dbError) {
      console.error('Database delete error:', dbError);
      return NextResponse.json({ message: 'Failed to delete record from database.', error: dbError }, { status: 500 });
    }

    return NextResponse.json({ message: 'Image and record deleted successfully!' }, { status: 200 });

  } catch (error: unknown) { // ★修正: any -> unknown
    console.error('API route error:', error);
    let errorMessage = 'An unknown error occurred.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    // errorがErrorインスタンスではないが、messageプロパティを持つ可能性があるオブジェクトの場合
    else if (typeof error === 'object' && error !== null && 'message' in error) {
      // messageプロパティが文字列であることを確認して使用
      if (typeof (error as { message: unknown }).message === 'string') {
        errorMessage = (error as { message: string }).message; // ★修正: (error as any).message -> (error as { message: string }).message
      }
    }
    return NextResponse.json({ message: 'Internal server error.', error: errorMessage }, { status: 500 });
  }
}