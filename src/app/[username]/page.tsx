import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import { getBaseUrl, PRIMARY_AUTHOR, PRIMARY_PUBLISHER, DEFAULT_AVATAR } from '@/src/lib/seo-config';
import PublicUserClient from './PublicUserClient';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = username ? username.toLowerCase().trim() : '';
  const baseUrl = getBaseUrl();

  if (cleanUsername === 'mradmin' || cleanUsername === 'super-admin' || cleanUsername === 'super-saqib-admin') {
    return {
      title: 'Super Admin Control Center | Pro Toolkits by mrsaqib 242',
      description: 'Enterprise Security & System Control Center',
    };
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (profile) {
      const displayName = profile.name || profile.username;
      const isMainCreator = cleanUsername === 'mrsaqib' || cleanUsername === 'saqib' || cleanUsername.includes('242');
      const title =
        profile.seo_title ||
        (isMainCreator
          ? `mrsaqib 242 (@${profile.username}) | Official Master Pro Toolkit`
          : `${displayName} (@${profile.username}) | Verified Pro Toolkit (mrsaqib 242)`);
      const description =
        profile.seo_description ||
        profile.description ||
        `Explore verified tools, direct WhatsApp link, and exclusive resources curated by @${profile.username} on Pro Toolkits (powered by mrsaqib 242).`;
      const avatar = profile.avatar_url || DEFAULT_AVATAR;
      const keywords =
        profile.seo_keywords ||
        `${profile.username}, verified toolkit, ${displayName}, free tools, termux tools, mrsaqib, 242, mrsaqib 242, pro toolkits`;

      return {
        title,
        description,
        keywords,
        authors: [{ name: displayName }, PRIMARY_AUTHOR],
        creator: isMainCreator ? 'mrsaqib 242' : displayName,
        publisher: PRIMARY_PUBLISHER,
        metadataBase: new URL(baseUrl),
        alternates: {
          canonical: `/${profile.username}`,
        },
        icons: {
          icon: avatar,
          apple: avatar,
        },
        openGraph: {
          title,
          description,
          url: `/${profile.username}`,
          siteName: 'Pro Toolkits by mrsaqib 242',
          images: [
            {
              url: avatar,
              width: 600,
              height: 600,
              alt: `${displayName}'s Verified Avatar`,
            },
          ],
          type: 'profile',
        },
        twitter: {
          card: 'summary_large_image',
          site: '@mrsaqib242',
          creator: isMainCreator ? '@mrsaqib242' : `@${profile.username}`,
          title,
          description,
          images: [avatar],
        },
      };
    }
  } catch (err) {
    console.error('Error generating user SEO metadata:', err);
  }

  // Fallback metadata if user not found or while loading
  return {
    title: `@${cleanUsername} | Pro Toolkit Space (mrsaqib 242)`,
    description: `Official digital toolkit space for @${cleanUsername}. Fast, verified tools and resources by mrsaqib 242.`,
  };
}

export default async function PublicUserPage({ params }: Props) {
  const { username } = await params;
  const cleanUsername = username ? username.toLowerCase().trim() : '';
  const baseUrl = getBaseUrl();

  if (cleanUsername === 'mradmin' || cleanUsername === 'super-admin' || cleanUsername === 'super-saqib-admin') {
    redirect('/mradmin');
  }

  let jsonLd: any = null;
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (profile) {
      const displayName = profile.name || profile.username;
      const sameAs = [
        profile.social_whatsapp ? `https://wa.me/${profile.social_whatsapp.replace(/[^0-9]/g, '')}` : null,
        profile.social_tiktok,
        profile.social_youtube,
        profile.social_instagram,
        profile.social_telegram,
        profile.social_facebook,
        profile.social_twitter,
      ].filter(Boolean);

      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: displayName,
          alternateName: `@${profile.username}`,
          description: profile.description || 'Verified Toolkit Creator',
          image: profile.avatar_url,
          sameAs,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Pro Toolkits by mrsaqib 242',
          url: baseUrl,
        },
      };
    }
  } catch {}

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <PublicUserClient />
    </>
  );
}
