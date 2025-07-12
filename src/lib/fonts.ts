// lib/fonts.ts
import { Noto_Sans_JP, Open_Sans, Outfit } from 'next/font/google'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
});

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const fonts = {
  notoSansJP,
  openSans,
  outfit,
};

export const fontVariables = `
${fonts.notoSansJP.variable}
${fonts.openSans.variable}
${fonts.outfit.variable}
`;
