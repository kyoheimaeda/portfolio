'use server';

import { revalidatePath } from 'next/cache';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createClient } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { PhotoType } from './types/PhotoType';

// R2/S3 and Supabase client initialization
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT_URL = `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || '',
    secretAccessKey: R2_SECRET_ACCESS_KEY || '',
  },
});

const supabase = createClient();

// --- Server Action for Uploading Photos ---
export async function uploadPhotoAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const originalFileName = formData.get('original_file_name') as string || file?.name || '';

    if (!file) {
      throw new Error('No file uploaded.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileExtension = originalFileName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const r2ObjectKey = `images/gallery/${uniqueFileName}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: r2ObjectKey,
      Body: buffer,
      ContentType: file.type,
    }));

    const publicDomain = process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN;
    if (!publicDomain) {
      throw new Error('Missing NEXT_PUBLIC_R2_PUBLIC_DOMAIN environment variable.');
    }
    const publicUrl = `${publicDomain}/${r2ObjectKey}`;

    const { data: dbData, error: dbError } = await supabase
      .from('gallery_images')
      .insert({
        url: publicUrl,
        path: r2ObjectKey,
        original_file_name: originalFileName,
        size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    revalidatePath('/gallery');
    return { success: true, newPhoto: dbData as PhotoType };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

// --- Server Action for Updating Photo Order ---


export async function updatePhotoOrderAction(updates: PhotoType[]) {
  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('No updates provided or invalid format.');
    }

    const { error: dbError } = await supabase
      .from('gallery_images')
      .upsert(updates, { onConflict: 'id' });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    revalidatePath('/gallery');
    return { success: true };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

// --- Server Action for Deleting Photos ---
export async function deletePhotoAction(photo: PhotoType) {
  try {
    if (!photo.id || !photo.path) {
      throw new Error('Image ID and path are required.');
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: photo.path,
    }));

    const { error: dbError } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', photo.id);

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    revalidatePath('/gallery');
    return { success: true };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
