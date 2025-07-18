// src/app/api/upload-image/route.ts
// これはサーバーサイドのコードであり、ブラウザからは実行されません。
import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@/lib/supabaseClient'; // Supabase DB接続用

// Supabase DBクライアントはトップレベルでOK
const supabase = createClient();

export async function POST(req: NextRequest) {
  // ★ R2の認証情報を環境変数から取得し、POST関数内で初期化
  const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
  const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
  const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME; // web-app-assets

  // R2のS3互換エンドポイントURLもここで定義
  // ★ 修正点: cloudflstorage から cloudflarestorage に修正
  const R2_ENDPOINT_URL = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  // S3クライアントもPOST関数内で初期化
  const s3Client = new S3Client({
    region: 'auto', // Cloudflare R2 は 'auto' でOK
    endpoint: R2_ENDPOINT_URL,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID as string,
      secretAccessKey: R2_SECRET_ACCESS_KEY as string,
    },
  });

  // 環境変数が設定されているか確認
  if (!CLOUDFLARE_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    const missingVars = [];
    if (!CLOUDFLARE_ACCOUNT_ID) missingVars.push('CLOUDFLARE_ACCOUNT_ID');
    if (!R2_ACCESS_KEY_ID) missingVars.push('R2_ACCESS_KEY_ID');
    if (!R2_SECRET_ACCESS_KEY) missingVars.push('R2_SECRET_ACCESS_KEY');
    if (!R2_BUCKET_NAME) missingVars.push('R2_BUCKET_NAME');
    console.error('Missing R2 environment variables:', missingVars.join(', '));
    return NextResponse.json(
      { message: `Missing R2 environment variables: ${missingVars.join(', ')}. Please check your .env.local file.`, error: 'Environment Variable Error' },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const originalFileNameFromForm = formData.get('original_file_name');
    const originalFileName = (originalFileNameFromForm as string || file?.name || '');

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded.' }, { status: 400 });
    }

    if (!originalFileName) {
        console.error('Error: originalFileName is empty or null after all attempts.');
        return NextResponse.json({ message: 'File name could not be determined for processing.', error: 'File Name Determination Error' }, { status: 500 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExtension = originalFileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const r2ObjectKey = `images/gallery/${uniqueFileName}`;

    const uploadCommand = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2ObjectKey,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(uploadCommand);

    const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
    if (!publicDomain) {
      console.error('NEXT_PUBLIC_R2_PUBLIC_DOMAIN is not set.');
      return NextResponse.json(
        { message: 'Missing NEXT_PUBLIC_R2_PUBLIC_DOMAIN environment variable.', error: 'Environment Variable Error' },
        { status: 500 }
      );
    }
    const publicUrl = `${publicDomain}/${r2ObjectKey}`;

    // Supabaseデータベースに保存
    const { data: dbData, error: dbError } = await supabase
      .from('gallery_images')
      .insert({
        url: publicUrl,
        path: r2ObjectKey,
        original_file_name: originalFileName,
        size: file.size,
        mime_type: file.type,
      })
      .select();

    if (dbError) {
      console.error('Database insert error:', dbError);
      return NextResponse.json({ message: 'Failed to save to database.', error: dbError.message || 'Unknown DB error' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Upload and save successful!',
      newPhoto: dbData[0],
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('API route error caught in catch block:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    }
    return NextResponse.json({ message: 'Internal server error.', error: errorMessage }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};