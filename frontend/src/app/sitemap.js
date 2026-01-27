export default async function sitemap() {
    // Base URLs for static pages
    const staticPages = [
        {
            url: 'https://www.muzikax.com/',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://www.muzikax.com/explore',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: 'https://www.muzikax.com/tracks',
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: 'https://www.muzikax.com/albums',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: 'https://www.muzikax.com/artists',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: 'https://www.muzikax.com/upload',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: 'https://www.muzikax.com/login',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: 'https://www.muzikax.com/terms',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: 'https://www.muzikax.com/about',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://www.muzikax.com/contact',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: 'https://www.muzikax.com/faq',
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        },
        {
            url: 'https://www.muzikax.com/privacy',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: 'https://www.muzikax.com/copyright',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];
    try {
        // Fetch dynamic content - tracks
        let allTracks = [];
        try {
            // Try to fetch all tracks for the sitemap
            const trackResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks?limit=1000`);
            if (trackResponse.ok) {
                const trackData = await trackResponse.json();
                allTracks = Array.isArray(trackData.tracks) ? trackData.tracks : [];
            }
        }
        catch (trackError) {
            console.error('Error fetching tracks for sitemap:', trackError);
            // Add a placeholder for tracks if API fails
            allTracks = [];
        }
        // Fetch dynamic content - albums
        let allAlbums = [];
        try {
            // Try to fetch all albums for the sitemap
            const albumResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums?limit=1000`);
            if (albumResponse.ok) {
                const albumData = await albumResponse.json();
                allAlbums = Array.isArray(albumData.albums) ? albumData.albums : [];
            }
        }
        catch (albumError) {
            console.error('Error fetching albums for sitemap:', albumError);
            // Add a placeholder for albums if API fails
            allAlbums = [];
        }
        // Create URLs for each track
        const trackUrls = allTracks.map((track) => ({
            url: `https://www.muzikax.com/tracks/${track._id}`,
            lastModified: track.updatedAt ? new Date(track.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));
        // Create URLs for each album
        const albumUrls = allAlbums.map((album) => ({
            url: `https://www.muzikax.com/album/${album._id}`,
            lastModified: album.updatedAt ? new Date(album.updatedAt) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        }));
        // Combine all URLs
        return [
            ...staticPages,
            ...trackUrls,
            ...albumUrls,
        ];
    }
    catch (error) {
        console.error('Error generating sitemap:', error);
        // Return just the static pages if there's an error
        return staticPages;
    }
}
