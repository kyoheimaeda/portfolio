import type { Metadata } from "next";
import { fontVariables } from '@/lib/fonts'
import "@/styles//globals.scss";
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import ThemeProvider from '@/components/Ui/ThemeProvider';
import MouseFollower from '@/components/MouseFollower';
import Template from "./template";

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
          <Template>
              {children}
          </Template>
          <Footer />
        </ThemeProvider>
        <MouseFollower />
      </body>
    </html>
  );
}
