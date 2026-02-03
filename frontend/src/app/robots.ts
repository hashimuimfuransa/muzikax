import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/profile/edit'],
    },
    sitemap: 'https://www.muzikax.com/sitemap.xml',
  }
}