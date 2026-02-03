export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/dashboard/', '/profile/edit'],
        },
        sitemap: 'https://www.muzikax.com/sitemap.xml',
    };
}
