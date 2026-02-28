import { Metadata } from 'next';
import { ReactNode } from 'react';
import { COUNTRY_LANGUAGES, COUNTRIES } from '@/config/locales';

// 使用 edge runtime 以兼容 Cloudflare Pages
export const runtime = 'edge';

// 允许所有 language 参数动态处理
export const dynamicParams = true;

type Props = {
  children: ReactNode;
  params: Promise<{ country: string; language: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, language } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://qola.com';

  const languagesConfig: Record<string, string> = {
    'x-default': `${baseUrl}/countries`,
  };

  Object.entries(COUNTRY_LANGUAGES).forEach(([c, langs]) => {
    langs.forEach((l) => {
      const hreflang = `${l}-${c.toUpperCase()}`;
      languagesConfig[hreflang] = `${baseUrl}/${c}/${l}`;
    });
  });

  languagesConfig['en'] = `${baseUrl}/glo/en`;

  const isStandardCountry = Object.keys(COUNTRY_LANGUAGES).includes(country);
  const ogLocale = isStandardCountry ? `${language}_${country.toUpperCase()}` : language;

  return {
    alternates: {
      canonical: `${baseUrl}/${country}/${language}`,
      languages: languagesConfig,
    },
    openGraph: {
      locale: ogLocale
    }
  };
}

export default async function LanguageLayout({ children, params }: Props) {
  const { country, language } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://qola.com';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "QOLA",
    "url": baseUrl,
  };

  const countryConfig = COUNTRIES.find(c => c.code === country);
  const countryName = countryConfig ? countryConfig.name : (country === 'glo' ? 'Global' : country.toUpperCase());

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Countries",
        "item": `${baseUrl}/countries`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": countryName,
        "item": `${baseUrl}/${country}/${language}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {children}
    </>
  );
}
