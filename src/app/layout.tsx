import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import './globals.css';
import { SelectionProvider } from '@/components/SelectionProvider';
import '@/components/selection.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  icons: { icon: '/assets/portable-mark.svg' },
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} — IT services`, template: `%s · ${SITE_NAME}` },
  description:
    'Web and mobile development, design, infrastructure, data and support — priced up front, delivered by a senior team.',
  openGraph: { siteName: SITE_NAME, type: 'website' },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    // Скрипт лендинга до гидратации добавляет на <html> класс `motion-pending`.
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans"><SelectionProvider>{children}</SelectionProvider></body>
    </html>
  );
}
