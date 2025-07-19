import prisma from '@/lib/prismaClient'; // Prisma Clientをインポート
import ClientGallery from './components/ClientGallery';
import PageWrap from '@/components/layout/PageWrap';

export const revalidate = false;

export default async function GalleryPage() {
  const photos = await prisma.galleryImage.findMany({
    orderBy: [
      { order: 'asc' },
      { created_at: 'desc' },
    ],
  });

  return (
    <PageWrap title='GALLERY'>
      <ClientGallery photos={photos} />
    </PageWrap>
  );
}