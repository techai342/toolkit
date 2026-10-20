/**
 * SEO & Branding Configuration for Pro-Toolkits
 * Featuring primary author, creator, and publisher tags for mrsaqib 242
 */

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, '');
  }
  return 'https://protoolkits.com';
}

export const MAIN_BRAND_TAGS = [
  'mrsaqib',
  '242',
  'mrsaqib 242',
  'mr saqib 242',
  'saqib 242',
  'saqib pro toolkits',
  'pro toolkits',
  'all in one toolkit',
  'termux tools',
  'link in bio',
  'verified pro toolkit',
  'techai',
  'developer tools',
  'free web utilities',
  'tiktok downloader',
  'sms bomber',
  'sim database',
  'ai image generator',
  'ai chatbot'
];

export const PRIMARY_AUTHOR = {
  name: 'mrsaqib 242',
  url: 'https://protoolkits.com'
};

export const PRIMARY_PUBLISHER = 'mrsaqib 242 (Pro Toolkits)';

export const DEFAULT_AVATAR = 'https://i.pinimg.com/736x/db/5e/0a/db5e0ab846238200926faca796937740.jpg';
export const DEFAULT_BANNER = 'https://ik.imagekit.io/19imy4f1u/lite_1777873821726_uJdS_Nmt2.jpeg';

export function getRootJsonLd(baseUrl: string) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Pro Toolkits by mrsaqib 242',
      alternateName: ['mrsaqib 242 Toolkits', 'Pro Toolkits'],
      url: baseUrl,
      description: 'All-in-One Digital Power Toolkit & Creator Ecosystem built by mrsaqib 242. Build viral websites, tools, portfolios, and AI utilities without coding.',
      author: {
        '@type': 'Person',
        name: 'mrsaqib 242',
        url: baseUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Pro Toolkits',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: DEFAULT_AVATAR,
        },
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/{search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Pro Toolkits',
      alternateName: 'mrsaqib 242 Digital Lab',
      url: baseUrl,
      logo: DEFAULT_AVATAR,
      founder: {
        '@type': 'Person',
        name: 'mrsaqib 242',
        alternateName: ['mrsaqib', '242', 'saqib 242'],
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'mrsaqib 242',
      alternateName: ['mrsaqib', '242', 'saqib 242', 'mr saqib 242'],
      url: baseUrl,
      jobTitle: 'Lead Software Architect & Creator',
      worksFor: {
        '@type': 'Organization',
        name: 'Pro Toolkits',
      },
      description: 'Founder and architect of Pro Toolkits, providing all-in-one viral utilities, termux tools, developer resources, and creator spaces.',
    }
  ];
}
