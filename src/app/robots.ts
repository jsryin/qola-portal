import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://qola.com';

    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/_next/static/'],
            disallow: ['/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
