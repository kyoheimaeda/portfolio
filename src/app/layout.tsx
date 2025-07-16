// src/app/layout.tsx

import type { Metadata } from "next";
import { fontVariables } from '@/lib/fonts'
import "@/styles//globals.scss";
import Header from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';
import ThemeProvider from '@/components/uissss/ThemeProvider';
import MouseFollower from '@/components/uissss/MouseFollower';

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
        <ThemeProvider>
          <Header />
          <main>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        <MouseFollower />
      </body>
    </html>
  );
}