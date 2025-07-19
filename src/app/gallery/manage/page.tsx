import PageWrap from '@/components/layout/PageWrap';
import prisma from '@/lib/prismaClient'; // Prisma Clientをインポート
import { GalleryImageType } from '@/features/gallery/types/GalleryImageType'; // GalleryImageTypeをインポート
import GalleryManager from './components/GalleryManager';

async function getPhotos() {
  const photos = await prisma.galleryImage.findMany({
    orderBy: [
      { order: 'asc' },
      { created_at: 'desc' },
    ],
  });

  return photos as GalleryImageType[];
}

export default async function ManageGalleryPage() {
  const photos = await getPhotos();

  return (
    <PageWrap>
      <GalleryManager initialPhotos={photos} />
    </PageWrap>
  );
}
