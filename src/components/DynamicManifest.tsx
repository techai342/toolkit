import { useEffect } from 'react';

interface Props {
  name: string;
  icon: string;
  username?: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  socialLinks?: Record<string, string | undefined>;
}

export default function DynamicManifest({
  name,
  icon,
  username,
  description,
  seoTitle,
  seoDescription,
  seoKeywords,
  socialLinks,
}: Props) {
  useEffect(() => {
    if (!name && !username) return;

    const displayName = name || username || 'Creator';
    const cleanUsername = username ? `@${username}` : displayName;
    const finalTitle =
      seoTitle || `${displayName} (${cleanUsername}) | Official Verified Toolkit`;
    const finalDescription =
      seoDescription ||
      description ||
      `Explore verified tools, direct WhatsApp link, exclusive resources, and digital assets curated by ${cleanUsername} on Pro Toolkits.`;
    const finalKeywords =
      seoKeywords ||
      `${cleanUsername}, ${displayName}, verified toolkit, termux tools, developer resources, mrsaqib, 242, mrsaqib 242, pro toolkits`;
    const currentUrl =
      typeof window !== 'undefined' ? window.location.href : `https://protoolkits.com/${username || ''}`;

    // 1. Update Document Title
    document.title = finalTitle;

    // 2. Helper to set/create <meta name="..." content="...">
    const setMetaByName = (nameAttr: string, content: string) => {
      let meta = document.querySelector(`meta[name="${nameAttr}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', nameAttr);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // 3. Helper to set/create <meta property="..." content="...">
    const setMetaByProperty = (propertyAttr: string, content: string) => {
      let meta = document.querySelector(`meta[property="${propertyAttr}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', propertyAttr);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // 4. Update Standard SEO Meta Tags
    setMetaByName('description', finalDescription);
    setMetaByName('keywords', finalKeywords);
    setMetaByName('author', displayName);

    // 5. Update Dynamic Favicons to Creator's Avatar
    if (icon) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = icon;

      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.rel = 'apple-touch-icon';
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = icon;
    }

    // 6. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = currentUrl.split('?')[0];

    // 7. Update OpenGraph Tags (Facebook, WhatsApp, Discord, Telegram, LinkedIn)
    setMetaByProperty('og:title', finalTitle);
    setMetaByProperty('og:description', finalDescription);
    setMetaByProperty('og:url', currentUrl);
    setMetaByProperty('og:type', 'profile');
    setMetaByProperty('og:site_name', 'Pro Toolkits by mrsaqib 242');
    if (icon) {
      setMetaByProperty('og:image', icon);
      setMetaByProperty('og:image:secure_url', icon);
      setMetaByProperty('og:image:alt', `${displayName} Profile`);
    }

    // 8. Update Twitter Card Tags
    setMetaByName('twitter:card', 'summary_large_image');
    setMetaByName('twitter:title', finalTitle);
    setMetaByName('twitter:description', finalDescription);
    if (icon) {
      setMetaByName('twitter:image', icon);
    }

    // 9. Update Schema.org JSON-LD Structured Data
    const sameAsUrls = socialLinks ? Object.values(socialLinks).filter(Boolean) as string[] : [];
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      dateCreated: new Date().toISOString(),
      mainEntity: {
        '@type': 'Person',
        name: displayName,
        alternateName: cleanUsername,
        description: finalDescription,
        image: icon,
        url: currentUrl,
        sameAs: sameAsUrls,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Pro Toolkits by mrsaqib 242',
      },
    };

    let schemaScript = document.getElementById('schema-org-jsonld') as HTMLScriptElement;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'schema-org-jsonld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaData);

    // 10. Dynamic PWA Web Manifest
    const manifest = {
      name: finalTitle,
      short_name: username || displayName,
      description: finalDescription,
      start_url: window.location.pathname + window.location.search,
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#0A0F1E',
      theme_color: '#A855F7',
      prefer_related_applications: false,
      icons: icon
        ? [
            {
              src: icon,
              sizes: '192x192',
              type: icon.includes('.png') ? 'image/png' : 'image/jpeg',
              purpose: 'any',
            },
            {
              src: icon,
              sizes: '512x512',
              type: icon.includes('.png') ? 'image/png' : 'image/jpeg',
              purpose: 'maskable',
            },
          ]
        : [],
    };

    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = blobUrl;

    // 11. Theme Color Meta Tag
    setMetaByName('theme-color', manifest.theme_color);

    return () => {
      URL.revokeObjectURL(blobUrl);
    };
  }, [name, icon, username, description, seoTitle, seoDescription, seoKeywords, socialLinks]);

  return null;
}
