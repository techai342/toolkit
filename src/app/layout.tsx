import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#030014',
};

export const metadata: Metadata = {
  title: 'All-in-One Power Toolkit | No Coding Needed',
  description:
    'Build your digital empire with our powerhouse toolkit. Create websites, portfolios, short links, AI apps, and more without any coding skills. Fast, smart, and beginner-friendly!',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tool Kit Pro',
  },
  icons: {
    apple: 'https://i.pinimg.com/736x/db/5e/0a/db5e0ab846238200926faca796937740.jpg',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    title: '🚀 All-in-One Power Toolkit – No Coding Needed!',
    description:
      'Build your digital empire with just one app ✨ Features: Toolkit Maker, Website Builder, Portfolio Creator, Short Link Generator, Smart Database & more. Fast, Smart & Beginner Friendly!',
    images: ['https://ik.imagekit.io/19imy4f1u/lite_1777873821726_uJdS_Nmt2.jpeg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🚀 All-in-One Power Toolkit – No Coding Needed!',
    description:
      'Build your digital empire with just one app ✨ Toolkit Maker, Website Builder, Portfolio Creator & more. No Coding Required!',
    images: ['https://ik.imagekit.io/19imy4f1u/lite_1777873821726_uJdS_Nmt2.jpeg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&family=Playfair+Display:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-[#030014] text-[#F0F0F0] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
