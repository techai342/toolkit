import type { Metadata } from 'next';
import { supabase } from '@/src/lib/supabase';
import PublicUserClient from './PublicUserClient';

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = username ? username.toLowerCase().trim() : '';

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (profile) {
      const displayName = profile.name || profile.username;
      const title =
        profile.seo_title ||
        `${displayName} (@${profile.username}) | Verified Pro Toolkit`;
      const description =
        profile.seo_description ||
        profile.description ||
        `Explore verified tools, direct WhatsApp link, and exclusive resources curated by @${profile.username} on Pro Toolkits.`;
      const avatar =
        profile.avatar_url ||
        'https://i.pinimg.com/736x/db/5e/0a/db5e0ab846238200926faca796937740.jpg';
      const keywords =
        profile.seo_keywords ||
        `${profile.username}, verified toolkit, ${displayName}, free tools, termux tools, pro toolkits`;

      return {
        title,
        description,
        keywords,
        authors: [{ name: displayName }],
        creator: displayName,
        publisher: 'Pro Toolkits',
        metadataBase: new URL('https://protoolkits.com'),
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
          siteName: 'Pro Toolkits',
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
    title: `@${cleanUsername} | Pro Toolkit Space`,
    description: `Official digital toolkit space for @${cleanUsername}. Fast, verified tools and resources.`,
  };
}

export default async function PublicUserPage({ params }: Props) {
  const { username } = await params;
  const cleanUsername = username ? username.toLowerCase().trim() : '';

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
