import type { Metadata } from 'next';
import { supabase } from '@/src/lib/supabase';
import { getBaseUrl, PRIMARY_AUTHOR, PRIMARY_PUBLISHER, DEFAULT_BANNER } from '@/src/lib/seo-config';
import DbClient from './DbClient';

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

  const title = `SIM Database & Number Verification Portal | @${cleanUser} Toolkit (mrsaqib 242)`;
  const description = `Live SIM verification, network tracker, and database lookup tools curated by @${cleanUser} on Pro Toolkits (mrsaqib 242). Fast, search-optimized portal.`;
  const url = `${baseUrl}/db/${cleanUser}`;

  return {
    title,
    description,
    keywords: [
      'sim database',
      'sim verification online',
      'number lookup portal',
      cleanUser,
      'mrsaqib',
      '242',
      'mrsaqib 242',
      'pro toolkits',
      'pak sim data live'
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
      images: [{ url: avatarUrl, width: 1200, height: 630, alt: 'SIM Database Portal' }],
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

export default async function DbPage({ params }: Props) {
  const { admin_username } = await params;
  const cleanUser = admin_username ? admin_username.toLowerCase().trim() : '';
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `SIM Database Portal by @${cleanUser}`,
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    url: `${baseUrl}/db/${cleanUser}`,
    description: 'Online SIM verification and lookup utility portal.',
    creator: { '@type': 'Person', name: 'mrsaqib 242' },
    provider: { '@type': 'Organization', name: 'Pro Toolkits', url: baseUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DbClient />
    </>
  );
}
