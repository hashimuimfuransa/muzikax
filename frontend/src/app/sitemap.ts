import { MetadataRoute } from 'next';

// Helper function to fetch with timeout
async function fetchWithTimeout(url: string, timeout: number = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URLs for static pages
  const staticPages: MetadataRoute.Sitemap = [
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
      url: 'https://www.muzikax.com/discover',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
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
      url: 'https://www.muzikax.com/artists/spotlight',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.muzikax.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://www.muzikax.com/news',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://www.muzikax.com/guides',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.muzikax.com/resources',
      lastModified: new Date(),
      changeFrequency: 'monthly',
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
      url: 'https://www.muzikax.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
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
      url: 'https://www.muzikax.com/terms',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
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
    // Fetch dynamic content - tracks (limit to recent 50 to avoid timeout)
    let allTracks = [];
    try {
      // Try to fetch recent tracks for the sitemap
      const trackResponse = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/api/tracks?limit=50&sort=-createdAt`);
      if (trackResponse.ok) {
        const trackData = await trackResponse.json();
        allTracks = Array.isArray(trackData.tracks) ? trackData.tracks : [];
      }
    } catch (trackError) {
      console.error('Error fetching tracks for sitemap:', trackError);
      // Add a placeholder for tracks if API fails
      allTracks = [];
    }

    // Fetch dynamic content - albums (limit to recent 50 to avoid timeout)
    let allAlbums = [];
    try {
      // Try to fetch recent albums for the sitemap
      const albumResponse = await fetchWithTimeout(`${process.env.NEXT_PUBLIC_API_URL}/api/albums?limit=50&sort=-createdAt`);
      if (albumResponse.ok) {
        const albumData = await albumResponse.json();
        allAlbums = Array.isArray(albumData.albums) ? albumData.albums : [];
      }
    } catch (albumError) {
      console.error('Error fetching albums for sitemap:', albumError);
      // Add a placeholder for albums if API fails
      allAlbums = [];
    }

    // Create URLs for each track (limit to first 50 to avoid timeout)
    const trackUrls: MetadataRoute.Sitemap = allTracks.slice(0, 50).map((track: any) => ({
      url: `https://www.muzikax.com/tracks/${track._id}`,
      lastModified: track.updatedAt ? new Date(track.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Create URLs for each album (limit to first 50 to avoid timeout)
    const albumUrls: MetadataRoute.Sitemap = allAlbums.slice(0, 50).map((album: any) => ({
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
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return just the static pages if there's an error
    return staticPages;
  }
}