import type { Metadata } from 'next';
import { supabase } from '@/src/lib/supabase';
import { getBaseUrl, PRIMARY_AUTHOR, PRIMARY_PUBLISHER, DEFAULT_BANNER } from '@/src/lib/seo-config';
import ImageClient from './ImageClient';

interface Props {
  params: Promise<{ admin_username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { admin_username } = await params;
  const cleanUser = admin_username ? admin_username.toLowerCase().trim() : '';
  const baseUrl = getBaseUrl();

  let avatarUrl = DEFAULT_BANNER;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('username', cleanUser)
      .maybeSingle();
    if (profile?.avatar_url) avatarUrl = profile.avatar_url;
  } catch {}

  const title = `AI Image Generator & Creative Studio | @${cleanUser} Toolkit (mrsaqib 242)`;
  const description = `Generate realistic 4K art, 3D portraits, anime visuals, and creative digital designs with AI curated by @${cleanUser} on Pro Toolkits (mrsaqib 242).`;
  const url = `${baseUrl}/image/${cleanUser}`;

  return {
    title,
    description,
    keywords: [
      'ai image generator',
      'text to image ai',
      'create ai art free',
      cleanUser,
      'mrsaqib',
      '242',
      'mrsaqib 242',
      'pro toolkits',
      'ai art maker'
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
      images: [{ url: avatarUrl, width: 1200, height: 630, alt: 'AI Image Generator Studio' }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [avatarUrl],
    },
  };
}

export default async function ImagePage({ params }: Props) {
  const { admin_username } = await params;
  const cleanUser = admin_username ? admin_username.toLowerCase().trim() : '';
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `AI Image Generator by @${cleanUser}`,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All',
    url: `${baseUrl}/image/${cleanUser}`,
    description: 'AI Text-to-Image Generation and Design Studio.',
    creator: { '@type': 'Person', name: 'mrsaqib 242' },
    provider: { '@type': 'Organization', name: 'Pro Toolkits', url: baseUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ImageClient />
    </>
  );
}
