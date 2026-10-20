import type { MetadataRoute } from 'next';
import { supabase } from '@/src/lib/supabase';
import { getBaseUrl } from '@/src/lib/seo-config';

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const currentDate = new Date();

  // Static core routes with flagship mrsaqib 242 ranking
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // Priority mrsaqib flagship entries
    {
      url: `${baseUrl}/mrsaqib`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/saqib`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/242`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    // 1. Fetch live creator profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, created_at')
      .limit(1000);

    const profileRoutes: MetadataRoute.Sitemap = [];
    const specializedToolRoutes: MetadataRoute.Sitemap = [];

    if (profiles && profiles.length > 0) {
      for (const p of profiles) {
        if (!p.username) continue;
        const cleanUser = p.username.toLowerCase().trim();
        const lastMod = p.created_at ? new Date(p.created_at) : currentDate;
        const isMaster = cleanUser === 'mrsaqib' || cleanUser === 'saqib' || cleanUser.includes('242');

        profileRoutes.push({
          url: `${baseUrl}/${cleanUser}`,
          lastModified: lastMod,
          changeFrequency: isMaster ? 'daily' : 'weekly',
          priority: isMaster ? 1.0 : 0.9,
        });

        // Specialized tools for creator
        specializedToolRoutes.push(
          {
            url: `${baseUrl}/tiktok/${cleanUser}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.75,
          },
          {
            url: `${baseUrl}/bomber/${cleanUser}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.75,
          },
          {
            url: `${baseUrl}/db/${cleanUser}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.75,
          },
          {
            url: `${baseUrl}/image/${cleanUser}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.75,
          },
          {
            url: `${baseUrl}/cb/${cleanUser}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.75,
          }
        );
      }
    }

    // 2. Fetch tools
    const { data: tools } = await supabase
      .from('tools')
      .select('id, user_id, slug, name, is_media, created_at, profiles(username)')
      .limit(1000);

    const toolRoutes: MetadataRoute.Sitemap = [];
    if (tools && tools.length > 0) {
      for (const t of tools as any[]) {
        const username = t.profiles?.username?.toLowerCase().trim();
        if (!username) continue;
        const toolIdentifier = t.slug || t.name?.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (toolIdentifier) {
          toolRoutes.push({
            url: `${baseUrl}/${username}/${toolIdentifier}`,
            lastModified: t.created_at ? new Date(t.created_at) : currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
        if (t.is_media && t.id) {
          toolRoutes.push({
            url: `${baseUrl}/${username}/media/${t.id}`,
            lastModified: t.created_at ? new Date(t.created_at) : currentDate,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      }
    }

    // Combine and deduplicate
    const allUrls = new Map<string, MetadataRoute.Sitemap[number]>();
    for (const item of [...staticRoutes, ...profileRoutes, ...toolRoutes, ...specializedToolRoutes]) {
      allUrls.set(item.url, item);
    }

    return Array.from(allUrls.values());
  } catch (err) {
    console.warn('Notice generating dynamic sitemap:', err);
    return staticRoutes;
  }
}
