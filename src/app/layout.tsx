import type { Metadata } from "next";
import { fontVariables } from '@/lib/fonts'
import "@/styles//globals.scss";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageMotion from '@/components/PageMotion';
import ColorChanger from '@/components/ColorChanger';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: {
    default: 'Kyohei Maeda',
    template: '%s | Kyohei Maeda',
  },
  description: '自己学習のためのサイトです。',
};

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="ja" className={fontVariables}>
      <body>
        <ColorChanger />
        <ThemeProvider>
          <PageMotion>
            <Header />
              {children}
            <Footer />
          </PageMotion>
        </ThemeProvider>
      </body>
    </html>
  );
}
