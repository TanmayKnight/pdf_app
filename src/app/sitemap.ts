import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://swiftpdf-demo.vercel.app'; // Placeholder URL

    const routes = [
        '',
        '/merge-pdf',
        '/split-pdf',
        '/compress-pdf',
        '/pdf-to-image',
        '/image-to-pdf',
        '/rotate-pdf',
        '/protect-pdf',
        '/unlock-pdf',
        '/login',
        '/signup',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));
}
