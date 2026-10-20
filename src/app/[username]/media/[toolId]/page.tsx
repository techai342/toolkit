import type { Metadata } from 'next';
import { supabase } from '@/src/lib/supabase';
import { getBaseUrl, PRIMARY_AUTHOR, PRIMARY_PUBLISHER, DEFAULT_BANNER } from '@/src/lib/seo-config';
import MediaClient from './MediaClient';

interface Props {
  params: Promise<{ username: string; toolId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, toolId } = await params;
  const cleanUser = username ? username.toLowerCase().trim() : '';
  const baseUrl = getBaseUrl();

  let mediaName = 'Exclusive Digital Media File';
  let mediaImage = DEFAULT_BANNER;

  try {
    const { data: tool } = await supabase
      .from('tools')
      .select('name, image_url, category')
      .eq('id', toolId)
      .maybeSingle();

    if (tool?.name) mediaName = tool.name;
    if (tool?.image_url) mediaImage = tool.image_url;
  } catch {}

  const title = `Download ${mediaName} | Verified File by @${cleanUser} (mrsaqib 242)`;
  const description = `Direct secure download for "${mediaName}". Verified by @${cleanUser} on Pro Toolkits (mrsaqib 242). High speed download server with instant link.`;
  const url = `${baseUrl}/${cleanUser}/media/${toolId}`;

  return {
    title,
    description,
    keywords: [
      mediaName,
      `download ${mediaName}`,
      cleanUser,
      'mrsaqib',
      '242',
      'mrsaqib 242',
      'pro toolkits',
      'direct download'
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
      images: [{ url: mediaImage, width: 1200, height: 630, alt: mediaName }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [mediaImage],
    },
  };
}

export default async function MediaDownloadCatchPage({ params }: Props) {
  const { username, toolId } = await params;
  const cleanUser = username ? username.toLowerCase().trim() : '';
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DigitalDocument',
    name: 'Download Media Asset',
    url: `${baseUrl}/${cleanUser}/media/${toolId}`,
    creator: { '@type': 'Person', name: 'mrsaqib 242' },
    publisher: { '@type': 'Organization', name: 'Pro Toolkits', url: baseUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MediaClient />
    </>
  );
}
