import type { Metadata } from 'next';
import { Fraunces, Work_Sans } from 'next/font/google';
import './globals.css';
import { NavBar } from '@/components/nav-bar';
import { SessionProvider } from '@/lib/session';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['500', '600', '700'],
});

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-worksans',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Allo Dakar — Trajets interurbains au Sénégal',
  description:
    "Trouvez un chauffeur disponible pour votre trajet entre villes, avec prise en charge à domicile.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${workSans.variable}`}>
        <SessionProvider>
          <NavBar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
