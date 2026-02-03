import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchTrackById } from '../../../services/trackService';
import Script from 'next/script';

interface Track {
  _id: string;
  id: string;
  title: string;
  artist: string;
  album?: string;
  plays: number;
  likes: number;
  coverImage: string;
  coverURL?: string;
  audioURL: string;
  duration?: string;
  genre?: string;
  releaseDate?: string;
  description?: string;
  paymentType?: 'free' | 'paid';
  price?: number;
  currency?: string;
  creatorId: {
    _id: string;
    name: string;
    avatar?: string;
    whatsappContact?: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const trackId = resolvedParams.id;
  
  // Validate that we have a proper track ID
  if (!trackId || trackId === "undefined") {
    console.error("Invalid track ID for metadata generation:", trackId);
    return {
      title: "Track Not Found | MuzikaX",
      description: "The requested track could not be found."
    };
  }
  
  try {
    const fetchedTrack = await fetchTrackById(trackId);
    // Map the ITrack type to the Track interface used in this component
    const track: Track = {
      ...fetchedTrack,
      id: fetchedTrack._id,
      artist: typeof fetchedTrack.creatorId === 'object' && fetchedTrack.creatorId !== null
        ? (fetchedTrack.creatorId as any).name
        : 'Unknown Artist',
      coverImage: fetchedTrack.coverURL || '',
      creatorId: typeof fetchedTrack.creatorId === 'object' && fetchedTrack.creatorId !== null
        ? fetchedTrack.creatorId as any
        : { _id: '', name: 'Unknown Artist' },
    };
    
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
      title: `${track.title} by ${track.artist} | MuzikaX - Rwanda's Digital Music Ecosystem`,
      description: track.description || `Listen to ${track.title} by ${track.artist} on MuzikaX - Rwanda's premier music platform.`,
      keywords: [
        track.title,
        track.artist,
        track.genre || '',
        'Rwandan music',
        'Afrobeats',
        'African music',
        'Music streaming'
      ].filter(Boolean),
      openGraph: {
        title: `${track.title} by ${track.artist}`,
        description: track.description || `Listen to ${track.title} by ${track.artist}`,
        type: 'music.song',
        url: `/tracks/${track._id}`,
        images: [
          {
            url: track.coverURL || track.coverImage || '/default-cover.jpg',
            width: 1200,
            height: 630,
            alt: `${track.title} cover art`,
          },
        ],
        siteName: 'MuzikaX',
        locale: 'en_US',
        determiner: 'the',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${track.title} by ${track.artist}`,
        description: track.description || `Listen to ${track.title} by ${track.artist}`,
        images: [track.coverURL || track.coverImage || '/default-cover.jpg'],
      },
      alternates: {
        canonical: `/tracks/${track._id}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching track for metadata:', error);
    return {
      title: 'Track Not Found | MuzikaX',
      description: 'The requested track could not be found.',
    };
  }
}

export default async function TrackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const trackId = resolvedParams.id;
  
  // Validate that we have a proper track ID
  if (!trackId || trackId === "undefined") {
    console.error("Invalid track ID:", trackId);
    notFound();
  }
  
  let track: Track;
  
  try {
    const fetchedTrack = await fetchTrackById(trackId);
    // Map the ITrack type to the Track interface used in this component
    track = {
      ...fetchedTrack,
      id: fetchedTrack._id,
      artist: typeof fetchedTrack.creatorId === 'object' && fetchedTrack.creatorId !== null
        ? (fetchedTrack.creatorId as any).name
        : 'Unknown Artist',
      coverImage: fetchedTrack.coverURL || '',
      creatorId: typeof fetchedTrack.creatorId === 'object' && fetchedTrack.creatorId !== null
        ? fetchedTrack.creatorId as any
        : { _id: '', name: 'Unknown Artist' },
    };
  } catch (error) {
    console.error('Error fetching track:', error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Track header */}
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="md:w-1/3">
              <div className="relative">
                {track.coverURL || track.coverImage ? (
                  <img
                    src={track.coverURL || track.coverImage}
                    alt={`${track.title} cover`}
                    className="w-full rounded-2xl shadow-2xl"
                  />
                ) : (
                  <div className="w-full aspect-square bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] rounded-2xl flex items-center justify-center">
                    <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="flex flex-col justify-end h-full">
                <p className="text-[#FFCB2B] text-sm uppercase tracking-wider mb-2">
                  {track.genre || 'Song'}
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                  {track.title}
                </h1>
                <p className="text-xl text-gray-300 mb-6">
                  {track.artist}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-8">
                  <span>{track.plays?.toLocaleString() || '0'} plays</span>
                  <span>•</span>
                  <span>{track.likes?.toLocaleString() || '0'} likes</span>
                  <span>•</span>
                  <span>{track.duration || 'N/A'}</span>
                  {track.paymentType === 'paid' && track.price && (
                    <>
                      <span>•</span>
                      <span className="text-green-400 font-semibold">
                        {track.price.toLocaleString()} RWF
                      </span>
                    </>
                  )}
                </div>

                <div className="flex gap-4">
                  {/* Play button would go here */}
                  <button className="px-8 py-3 gradient-primary rounded-full text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                    </svg>
                    Play Track
                  </button>
                </div>

                {track.description && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                    <p className="text-gray-400">{track.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional track info */}
          <div className="card-bg rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Track Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
              <div>
                <p><span className="text-white">Artist:</span> {track.creatorId?.name || track.artist}</p>
                <p><span className="text-white">Plays:</span> {track.plays?.toLocaleString() || '0'}</p>
                <p><span className="text-white">Likes:</span> {track.likes?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p><span className="text-white">Genre:</span> {track.genre || 'N/A'}</p>
                <p><span className="text-white">Duration:</span> {track.duration || 'N/A'}</p>
                <p><span className="text-white">Release Date:</span> {track.releaseDate || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="track-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MusicRecording',
            name: track.title,
            description: track.description || `Listen to ${track.title} by ${track.artist}`,
            image: track.coverURL || track.coverImage || '/default-cover.jpg',
            url: `https://www.muzikax.com/tracks/${track._id}`,
            datePublished: track.releaseDate,
            duration: track.duration ? `PT${track.duration}` : undefined,
            genre: track.genre,
            track: {
              '@type': 'MusicRecording',
              name: track.title,
              url: `https://www.muzikax.com/tracks/${track._id}`,
            },
            byArtist: {
              '@type': 'MusicGroup',
              name: track.artist,
            },
            album: track.album ? {
              '@type': 'MusicAlbum',
              name: track.album,
            } : undefined,
            offers: {
              '@type': 'Offer',
              availability: 'https://schema.org/InStock',
              price: track.price?.toString() || '0',
              priceCurrency: track.currency || 'RWF',
            },
          }),
        }}
      />
    </div>
  );
}