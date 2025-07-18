'use server'; // これがサーバーアクションであることを宣言

import { revalidatePath } from 'next/cache';

export async function revalidateGalleryPage() {
  revalidatePath('/gallery');
}