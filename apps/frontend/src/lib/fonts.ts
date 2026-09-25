import { Inter, DM_Sans, Plus_Jakarta_Sans, Manrope } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800', '900'],
});

export const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '700', '900'],
});

export const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
});
