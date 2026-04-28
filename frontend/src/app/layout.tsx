import './globals.css';
import type { ReactNode } from 'react';

import Providers from './providers';

/**
 * Root layout: tum sayfalarda ortak kapsayici.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
