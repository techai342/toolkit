import type { Metadata } from 'next';
import { supabase } from '@/src/lib/supabase';
import { getBaseUrl, PRIMARY_AUTHOR, PRIMARY_PUBLISHER, DEFAULT_BANNER } from '@/src/lib/seo-config';
import PortfolioClient from './PortfolioClient';

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const cleanUser = username ? username.toLowerCase().trim() : '';
  const cleanSlug = slug ? slug.trim() : '';
  const baseUrl = getBaseUrl();

  let portfolioTitle = `${cleanSlug} Showcase`;
  let bannerUrl = DEFAULT_BANNER;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('username', cleanUser)
      .maybeSingle();

    if (profile?.id) {
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('title, image_url')
        .eq('user_id', profile.id)
        .eq('slug', cleanSlug)
        .maybeSingle();

      if (portfolio?.title) portfolioTitle = portfolio.title;
      if (portfolio?.image_url) bannerUrl = portfolio.image_url;
    }
  } catch {}

  const title = `${portfolioTitle} | @${cleanUser} Portfolio (mrsaqib 242)`;
  const description = `Interactive digital portfolio and creative showcases curated by @${cleanUser} on Pro Toolkits (mrsaqib 242).`;
  const url = `${baseUrl}/${cleanUser}/wb/${cleanSlug}`;

  return {
    title,
    description,
    keywords: [
      portfolioTitle,
      cleanUser,
      'portfolio showcase',
      'mrsaqib',
      '242',
      'mrsaqib 242',
      'pro toolkits'
    ],
    authors: [PRIMARY_AUTHOR, { name: `@${cleanUser}` }],
    creator: PRIMARY_AUTHOR.name,
    publisher: PRIMARY_PUBLISHER,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Pro Toolkits by mrsaqib 242',
      images: [{ url: bannerUrl, width: 1200, height: 630, alt: portfolioTitle }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [bannerUrl],
    },
  };
}

export default async function PortfolioShowcasePage({ params }: Props) {
  const { username, slug } = await params;
  const cleanUser = username ? username.toLowerCase().trim() : '';
  const cleanSlug = slug ? slug.trim() : '';
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: cleanSlug,
    url: `${baseUrl}/${cleanUser}/wb/${cleanSlug}`,
    creator: { '@type': 'Person', name: 'mrsaqib 242' },
    publisher: { '@type': 'Organization', name: 'Pro Toolkits', url: baseUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioClient />
    </>
  );
}
