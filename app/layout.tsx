import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Caveat, Instrument_Sans } from 'next/font/google';
import { connection } from 'next/server';
import type { ReactNode } from 'react';
import Toaster from '@/components/Toast';
import { getShop } from '@/lib/server/vendor';
import { ShopProvider } from '@/lib/shop';
import './globals.css';

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-display',
  display: 'swap',
});

const body = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// The weaver's signature on the certificate.
const script = Caveat({
  subsets: ['latin'],
  weight: '600',
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Kutch Shawls', template: '%s · Kutch Shawls' },
  description:
    'Buy handwoven shawls straight from the weavers of Kutch, see how every piece is made, and learn the craft from them.',
};

export const viewport: Viewport = {
  themeColor: '#F5F3EF',
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // The shop is read from the vendor's studio on every visit, so nothing here is prerendered.
  await connection();
  const shop = (await getShop()) ?? { online: false, version: 0, products: [] };

  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${script.variable}`}>
      <body>
        <ShopProvider initial={shop}>
          <div className="app">{children}</div>
        </ShopProvider>
        <Toaster />
      </body>
    </html>
  );
}
