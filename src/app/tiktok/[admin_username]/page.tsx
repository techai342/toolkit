import type { Metadata } from 'next';
import { supabase } from '@/src/lib/supabase';
import { getBaseUrl, PRIMARY_AUTHOR, PRIMARY_PUBLISHER, DEFAULT_BANNER } from '@/src/lib/seo-config';
import TikTokClient from './TikTokClient';

interface Props {
  params: Promise<{ admin_username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { admin_username } = await params;
  const cleanUser = admin_username ? admin_username.toLowerCase().trim() : '';
  const baseUrl = getBaseUrl();

  let creatorName = cleanUser;
  let avatarUrl = DEFAULT_BANNER;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, username, avatar_url')
      .eq('username', cleanUser)
      .maybeSingle();

    if (profile?.name) creatorName = profile.name;
    if (profile?.avatar_url) avatarUrl = profile.avatar_url;
  } catch {}

  const title = `TikTok HD Video Downloader (No Watermark) | @${cleanUser} Toolkit (mrsaqib 242)`;
  const description = `Download TikTok videos without watermark in Full HD 1080p and high quality MP3 audio. Fast, free, and unlimited tool curated by @${cleanUser} on Pro Toolkits (mrsaqib 242).`;
  const url = `${baseUrl}/tiktok/${cleanUser}`;

  return {
    title,
    description,
    keywords: [
      'tiktok downloader',
      'tiktok video download without watermark',
      'tiktok mp3 download',
      cleanUser,
      'mrsaqib',
      '242',
      'mrsaqib 242',
      'pro toolkits',
      'free video downloader'
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
      images: [{ url: avatarUrl, width: 1200, height: 630, alt: 'TikTok Downloader Pro' }],
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

export default async function TikTokPage({ params }: Props) {
  const { admin_username } = await params;
  const cleanUser = admin_username ? admin_username.toLowerCase().trim() : '';
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `TikTok HD Video Downloader by @${cleanUser}`,
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'All',
    url: `${baseUrl}/tiktok/${cleanUser}`,
    description: 'Free online tool to download TikTok videos without watermark in HD.',
    creator: {
      '@type': 'Person',
      name: 'mrsaqib 242',
    },
    provider: {
      '@type': 'Organization',
      name: 'Pro Toolkits',
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TikTokClient />
    </>
  );
}
