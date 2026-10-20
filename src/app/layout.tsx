import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';
import { 
  getBaseUrl, 
  MAIN_BRAND_TAGS, 
  PRIMARY_AUTHOR, 
  PRIMARY_PUBLISHER, 
  DEFAULT_AVATAR, 
  DEFAULT_BANNER, 
  getRootJsonLd 
} from '@/src/lib/seo-config';

const baseUrl = getBaseUrl();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#030014',
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'mrsaqib 242 | All-in-One Power Toolkit & Digital Creator Space',
    template: '%s | Pro Toolkits by mrsaqib 242',
  },
  description:
    'Official digital powerhouse by mrsaqib 242. Build viral toolkits, link-in-bio spaces, interactive portfolios, termux tools, automated utilities, and AI apps without any coding skills. Fast, smart, and verified!',
  keywords: MAIN_BRAND_TAGS,
  authors: [PRIMARY_AUTHOR],
  creator: PRIMARY_AUTHOR.name,
  publisher: PRIMARY_PUBLISHER,
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Tool Kit Pro (mrsaqib 242)',
  },
  icons: {
    icon: DEFAULT_AVATAR,
    apple: DEFAULT_AVATAR,
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'Pro Toolkits by mrsaqib 242',
    title: 'mrsaqib 242 | All-in-One Power Toolkit – No Coding Needed!',
    description:
      'Build your digital empire with just one app ✨ Features: Toolkit Maker, Website Builder, Portfolio Creator, Short Link Generator, Smart Database & more curated by mrsaqib 242.',
    url: baseUrl,
    locale: 'en_US',
    images: [
      {
        url: DEFAULT_BANNER,
        width: 1200,
        height: 630,
        alt: 'mrsaqib 242 - Pro Toolkits Master Banner',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@mrsaqib242',
    creator: '@mrsaqib242',
    title: 'mrsaqib 242 | All-in-One Power Toolkit – No Coding Needed!',
    description:
      'Build your digital empire with just one app ✨ Toolkit Maker, Website Builder, Portfolio Creator & more by mrsaqib 242. No Coding Required!',
    images: [DEFAULT_BANNER],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdScripts = getRootJsonLd(baseUrl);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=JetBrains+Mono:wght@400;600&family=Playfair+Display:wght@700&family=Space+Grotesk:wght@500;700&family=Outfit:wght@600;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-[#030014] text-[#F0F0F0] antialiased">
        {jsonLdScripts.map((schema, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
