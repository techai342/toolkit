import type { Metadata } from 'next';
import { supabase } from '@/src/lib/supabase';
import { getBaseUrl, PRIMARY_AUTHOR, PRIMARY_PUBLISHER, DEFAULT_BANNER } from '@/src/lib/seo-config';
import BomberClient from './BomberClient';

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

  const title = `SMS Utility & Multi-Sender Suite | @${cleanUser} Toolkit (mrsaqib 242)`;
  const description = `Fast, reliable SMS utility and messaging automation suite curated by @${cleanUser} on Pro Toolkits (mrsaqib 242). Developer testing and verification tool.`;
  const url = `${baseUrl}/bomber/${cleanUser}`;

  return {
    title,
    description,
    keywords: [
      'sms utility',
      'sms sender tool',
      'messaging testing suite',
      cleanUser,
      'mrsaqib',
      '242',
      'mrsaqib 242',
      'pro toolkits',
      'termux sms tools'
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
      images: [{ url: avatarUrl, width: 1200, height: 630, alt: 'SMS Utility Suite' }],
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

export default async function BomberPage({ params }: Props) {
  const { admin_username } = await params;
  const cleanUser = admin_username ? admin_username.toLowerCase().trim() : '';
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `SMS Utility Suite by @${cleanUser}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    url: `${baseUrl}/bomber/${cleanUser}`,
    description: 'Fast SMS utility and testing automation suite.',
    creator: { '@type': 'Person', name: 'mrsaqib 242' },
    provider: { '@type': 'Organization', name: 'Pro Toolkits', url: baseUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BomberClient />
    </>
  );
}
