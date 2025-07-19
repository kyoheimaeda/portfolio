// lib/fonts.ts
import { Noto_Sans_JP, Open_Sans, Outfit } from 'next/font/google'
import localFont from 'next/font/local'

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

const anurati = localFont({
  src: '../assets/fonts/ANURATI/Anurati-Regular.otf',
  display: 'swap',
  variable: '--font-anurati',
});

export const fonts = {
  notoSansJP,
  openSans,
  outfit,
  anurati,
};

export const fontVariables = `
${fonts.notoSansJP.variable}
${fonts.openSans.variable}
${fonts.outfit.variable}
${fonts.anurati.variable}
`;
