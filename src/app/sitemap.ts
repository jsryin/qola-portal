import { MetadataRoute } from 'next';

import { COUNTRY_LANGUAGES } from '@/config/locales';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://qola.com';

    const sitemapEntries: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/countries`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        }
    ];

    Object.entries(COUNTRY_LANGUAGES).forEach(([country, langs]) => {
        langs.forEach((lang) => {
            sitemapEntries.push({
                url: `${baseUrl}/${country}/${lang}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.8,
            });
        });
    });

    sitemapEntries.push({
        url: `${baseUrl}/glo/en`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
    });

    return sitemapEntries;
}
