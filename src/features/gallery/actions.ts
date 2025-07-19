'use server';

import { revalidatePath } from 'next/cache';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import prisma from '@/lib/prismaClient';
import { v4 as uuidv4 } from 'uuid';
import { GalleryImageType } from './types/GalleryImageType';

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

    const dbData = await prisma.galleryImage.create({
      data: {
        url: publicUrl,
        path: r2ObjectKey,
        original_file_name: originalFileName,
        size: file.size,
        mime_type: file.type,
        order: 0, // 新規追加時は仮で0を設定。後で並び替えで調整
      },
    });

    revalidatePath('/gallery');
    return { success: true, newPhoto: dbData as GalleryImageType };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

// --- Server Action for Updating Photo Order ---
export async function updatePhotoOrderAction(updates: GalleryImageType[]) {
  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      throw new Error('No updates provided or invalid format.');
    }

    // PrismaではupsertManyがないため、個別にupdateManyまたはupsertを呼び出す
    // ここではupdateManyを使用し、idに基づいて更新する
    for (const update of updates) {
      await prisma.galleryImage.update({
        where: { id: update.id },
        data: { order: update.order },
      });
    }

    revalidatePath('/gallery');
    return { success: true };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}

// --- Server Action for Deleting Photos ---
export async function deletePhotoAction(photo: GalleryImageType) {
  try {
    if (!photo.id || !photo.path) {
      throw new Error('Image ID and path are required.');
    }

    await s3Client.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: photo.path,
    }));

    await prisma.galleryImage.delete({
      where: { id: photo.id },
    });

    revalidatePath('/gallery');
    return { success: true };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
