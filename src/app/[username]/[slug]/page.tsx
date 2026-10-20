import type { Metadata } from 'next';
import { supabase } from '@/src/lib/supabase';
import { getBaseUrl, PRIMARY_AUTHOR, PRIMARY_PUBLISHER, DEFAULT_BANNER } from '@/src/lib/seo-config';
import SmartRedirectClient from './SmartRedirectClient';

interface Props {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const cleanUser = username ? username.toLowerCase().trim() : '';
  const cleanSlug = slug ? slug.trim() : '';
  const baseUrl = getBaseUrl();

  let toolName = cleanSlug;
  let toolImage = DEFAULT_BANNER;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUser)
      .maybeSingle();

    if (profile?.id) {
      const { data: tool } = await supabase
        .from('tools')
        .select('name, image_url, category')
        .eq('user_id', profile.id)
        .or(`slug.ilike.${cleanSlug},name.ilike.${cleanSlug}`)
        .maybeSingle();

      if (tool?.name) toolName = tool.name;
      if (tool?.image_url) toolImage = tool.image_url;
    }
  } catch {}

  const title = `${toolName} | @${cleanUser} Pro Toolkit (mrsaqib 242)`;
  const description = `Access verified tool "${toolName}" curated by @${cleanUser} on Pro Toolkits (mrsaqib 242). High speed link, secure gateway, and instant access.`;
  const url = `${baseUrl}/${cleanUser}/${cleanSlug}`;

  return {
    title,
    description,
    keywords: [
      toolName,
      `${toolName} download`,
      cleanUser,
      'mrsaqib',
      '242',
      'mrsaqib 242',
      'pro toolkits',
      'verified tools'
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
      images: [{ url: toolImage, width: 1200, height: 630, alt: toolName }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [toolImage],
    },
  };
}

export default async function ToolRedirectPage({ params }: Props) {
  const { username, slug } = await params;
  const cleanUser = username ? username.toLowerCase().trim() : '';
  const cleanSlug = slug ? slug.trim() : '';
  const baseUrl = getBaseUrl();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: cleanSlug,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    url: `${baseUrl}/${cleanUser}/${cleanSlug}`,
    creator: { '@type': 'Person', name: 'mrsaqib 242' },
    publisher: { '@type': 'Organization', name: 'Pro Toolkits', url: baseUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SmartRedirectClient />
    </>
  );
}
