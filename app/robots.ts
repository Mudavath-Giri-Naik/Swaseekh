import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/admin/', '/api/', '/dashboard', '/dashboard/', '/login'],
    },
    sitemap: 'https://swaseekh.in/sitemap.xml',
    host: 'https://swaseekh.in',
  }
}
