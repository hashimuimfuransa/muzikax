import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAlbumById } from '../../../services/albumService';
import Script from 'next/script';

interface Creator {
  _id: string;
  name: string;
  avatar?: string;
}

interface AlbumTrack {
  _id: string;
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  coverURL?: string;
  duration?: string;
  audioUrl: string;
  audioURL: string;
  plays: number;
  likes: number;
  creatorId: string | Creator;
  type?: 'song' | 'beat' | 'mix'; // Add track type for WhatsApp functionality
  creatorWhatsapp?: string; // Add creator's WhatsApp contact
}

interface Album {
  _id: string;
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  coverURL?: string;
  year: number;
  tracks: AlbumTrack[];
  description?: string;
  genre?: string;
  creatorId: string | Creator;
  releaseDate?: string;
  createdAt: string;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const albumId = params.id;
  
  try {
    const album: any = await getAlbumById(albumId);
    
    return {
      title: `${album.title} by ${album.artist} | MuzikaX - Rwanda's Digital Music Ecosystem`,
      description: album.description || `Listen to ${album.title} by ${album.artist} on MuzikaX - Rwanda's premier music platform.`,
      keywords: [
        album.title,
        album.artist,
        album.genre || '',
        'Rwandan music',
        'Afrobeats',
        'African music',
        'Music album',
        'Music streaming'
      ].filter(Boolean),
      openGraph: {
        title: `${album.title} by ${album.artist}`,
        description: album.description || `Listen to ${album.title} by ${album.artist}`,
        type: 'music.album',
        url: `https://www.muzikax.com/album/${album._id}`,
        images: [
          {
            url: album.coverURL || album.coverImage || '/default-cover.jpg',
            width: 1200,
            height: 630,
            alt: `${album.title} album cover`,
          },
        ],
        siteName: 'MuzikaX',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${album.title} by ${album.artist}`,
        description: album.description || `Listen to ${album.title} by ${album.artist}`,
        images: [album.coverURL || album.coverImage || '/default-cover.jpg'],
      },
      alternates: {
        canonical: `https://www.muzikax.com/album/${album._id}`,
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
    console.error('Error fetching album for metadata:', error);
    return {
      title: 'Album Not Found | MuzikaX',
      description: 'The requested album could not be found.',
    };
  }
}

export default async function AlbumDetailPage({ params }: { params: { id: string } }) {
  const albumId = params.id;
  
  let album: Album;
  
  try {
    const albumData: any = await getAlbumById(albumId);
    
    // Transform the album data to match our interface
    album = {
      _id: albumData._id || '',
      id: albumData._id || albumData.id || albumId,
      title: albumData.title,
      artist: (albumData.creatorId && typeof albumData.creatorId === "object" && albumData.creatorId !== null) 
        ? albumData.creatorId.name 
        : "Unknown Artist",
      coverImage: (albumData.coverURL || albumData.coverImage) || "",
      coverURL: albumData.coverURL,
      year: (albumData.releaseDate || albumData.createdAt) ? new Date(albumData.releaseDate || albumData.createdAt).getFullYear() : new Date().getFullYear(),
      tracks: (Array.isArray(albumData.tracks) ? albumData.tracks : []).map((track: any) => {
        const artist = (track.creatorId && typeof track.creatorId === "object" && track.creatorId !== null) 
          ? (track.creatorId.name || "Unknown Artist")
          : (typeof track.creatorId === "string") 
          ? track.creatorId 
          : "Unknown Artist";
        return {
          _id: track._id || '',
          id: track._id || track.id || '',
          title: track.title,
          artist: artist,
          coverImage: (track.coverURL || track.coverImage) || "",
          coverURL: track.coverURL,
          duration: track.duration || "3:45", // Placeholder
          audioUrl: track.audioURL,
          audioURL: track.audioURL,
          plays: track.plays || 0,
          likes: track.likes || 0,
          creatorId: track.creatorId || '',
          type: track.type || 'song', // Include track type for WhatsApp functionality
          creatorWhatsapp: (track.creatorId && typeof track.creatorId === 'object' && track.creatorId !== null) 
            ? track.creatorId.whatsappContact 
            : undefined // Include creator's WhatsApp contact
        };
      }),
      description: albumData.description,
      genre: albumData.genre,
      creatorId: albumData.creatorId || '',
      releaseDate: albumData.releaseDate,
      createdAt: albumData.createdAt
    };
  } catch (error) {
    console.error('Error fetching album:', error);
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black py-8 sm:py-12">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF4D67]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFCB2B]/10 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <a 
            href="/albums"
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back
          </a>

          {/* Album Header */}
          <div className="flex flex-col md:flex-row gap-8 mb-12">
            <div className="md:w-1/3">
              <div className="relative">
                {(album.coverURL || album.coverImage) && (album.coverURL || album.coverImage).trim() !== '' ? (
                  <img 
                    src={album.coverURL || album.coverImage} 
                    alt={album.title} 
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
                <p className="text-[#FFCB2B] text-sm uppercase tracking-wider mb-2">Album</p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">{album.title}</h1>
                <p className="text-xl text-gray-300 mb-6">
                  <Link href={`/artist/${album.artist}`} className="hover:text-white transition-colors">
                    {album.artist}
                  </Link>
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-8">
                  <span>{album.year}</span>
                  <span>•</span>
                  <span>{album.tracks.length} songs</span>
                  <span>•</span>
                  <span>{album.genre}</span>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    className="px-8 py-3 gradient-primary rounded-full text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path>
                    </svg>
                    Play Album
                  </button>
                </div>
                
                {album.description && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                    <p className="text-gray-400">{album.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Track List */}
          <div className="card-bg rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Tracks</h2>
            
            <div className="space-y-2">
              {album.tracks.map((track, index) => (
                <div 
                  key={track._id || track.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  {/* Track Cover Image */}
                  <div className="w-12 h-12 flex-shrink-0">
                    {(track.coverURL || track.coverImage) && (track.coverURL || track.coverImage).trim() !== '' ? (
                      <img 
                        src={track.coverURL || track.coverImage} 
                        alt={track.title} 
                        className="w-full h-full rounded object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] rounded flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-8 text-center text-gray-500">
                    <span className="text-sm">{index + 1}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{track.title}</h3>
                    <p className="text-sm text-gray-400 truncate">
                      {typeof track.creatorId === 'object' && track.creatorId !== null 
                        ? (track.creatorId as any).name 
                        : typeof track.creatorId === 'string' 
                        ? track.creatorId 
                        : 'Unknown Artist'}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
                      </svg>
                      <span className="text-xs">{track.plays}</span>
                    </div>
                    
                    <button className="text-gray-500 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="album-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'MusicAlbum',
            name: album.title,
            description: album.description || `Listen to ${album.title} by ${album.artist}`,
            image: album.coverURL || album.coverImage || '/default-cover.jpg',
            url: `https://www.muzikax.com/album/${album._id}`,
            datePublished: album.releaseDate,
            genre: album.genre,
            byArtist: {
              '@type': 'MusicGroup',
              name: album.artist,
            },
            track: album.tracks.map(track => ({
              '@type': 'MusicRecording',
              name: track.title,
              url: `https://www.muzikax.com/tracks/${track._id}`,
              duration: track.duration ? `PT${track.duration}` : undefined,
            })),
            offers: {
              '@type': 'Offer',
              availability: 'https://schema.org/InStock',
              price: '0',
              priceCurrency: 'USD',
            },
          }),
        }}
      />
    </div>
  );
}