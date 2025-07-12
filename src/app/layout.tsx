import type { Metadata } from "next";
import { fontVariables } from '@/lib/fonts'
import "@/styles//globals.scss";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageMotion from '@/components/PageMotion';
import ColorChanger from '@/components/ColorChanger';

export const metadata: Metadata = {
  title: {
    default: 'Kyohei Maeda',
    template: '%s | Kyohei Maeda',
  },
  description: '自己学習のためのサイトです。',
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body>
        <ColorChanger />
        <PageMotion>
          <Header />
            {children}
          <Footer />
        </PageMotion>
      </body>
    </html>
  );
}
