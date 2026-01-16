import { useAudioPlayer } from '../contexts/AudioPlayerContext';

interface Track {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  plays?: number;
  likes?: number;
  duration?: string;
  category?: string;
  creatorId?: string;
  audioUrl?: string;
  type?: 'song' | 'beat' | 'mix';
  creatorWhatsapp?: string;
}

interface TrackCardProps {
  track: Track;
  fullTrackData?: any; // Full track data with audioUrl and other properties
  showPlayButton?: boolean;
  showLikeButton?: boolean;
}

export default function TrackCard({ 
  track, 
  fullTrackData, 
  showPlayButton = true, 
  showLikeButton = true 
}: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, setCurrentPlaylist, favorites, addToFavorites, removeFromFavorites } = useAudioPlayer();

  const handlePlay = () => {
    if (fullTrackData && fullTrackData.audioURL) {
      playTrack({
        id: track.id,
        title: track.title,
        artist: track.artist,
        coverImage: track.coverImage,
        audioUrl: fullTrackData.audioURL,
        creatorId: typeof fullTrackData.creatorId === 'object' && fullTrackData.creatorId !== null 
          ? (fullTrackData.creatorId as any)._id 
          : fullTrackData.creatorId,
        type: fullTrackData.type,
        creatorWhatsapp: (typeof fullTrackData.creatorId === 'object' && fullTrackData.creatorId !== null 
          ? (fullTrackData.creatorId as any).whatsappContact 
          : undefined)
      });

      // Set the current playlist to tracks from this section
      // We'll use the current track data for now
      const playlistTracks = [fullTrackData].filter((t: any) => t.audioURL).map((t: any) => ({
        id: t._id,
        title: t.title,
        artist: typeof t.creatorId === "object" && t.creatorId !== null 
          ? (t.creatorId as any).name 
          : "Unknown Artist",
        coverImage: t.coverURL || '',
        audioUrl: t.audioURL,
        creatorId: typeof t.creatorId === 'object' && t.creatorId !== null 
          ? (t.creatorId as any)._id 
          : t.creatorId,
        type: t.type,
        creatorWhatsapp: (typeof t.creatorId === 'object' && t.creatorId !== null 
          ? (t.creatorId as any).whatsappContact 
          : undefined)
      }));
      setCurrentPlaylist(playlistTracks);
    }
  };

  const toggleFavorite = () => {
    if (fullTrackData) {
      const isFavorite = favorites.some(fav => fav.id === track.id);
      if (isFavorite) {
        removeFromFavorites(track.id);
      } else {
        addToFavorites({
          id: track.id,
          title: track.title,
          artist: track.artist,
          coverImage: track.coverImage || '',
          audioUrl: track.audioUrl || '',
          creatorId: track.creatorId,
          type: track.type as 'song' | 'beat' | 'mix' | undefined,
          creatorWhatsapp: track.creatorWhatsapp
        });
      }
    }
  };

  const isFavorite = favorites.some(fav => fav.id === track.id);

  return (
    <div className="flex-shrink-0 w-48 sm:w-52 md:w-52 lg:w-56 group card-bg rounded-xl overflow-hidden transition-all duration-300 hover:border-[#FF4D67]/50 hover:bg-gradient-to-br hover:from-gray-900/70 hover:to-gray-900/50 hover:shadow-xl hover:shadow-[#FF4D67]/10">
      <div className="relative">
        {track.coverImage && track.coverImage.trim() !== '' ? (
          <img
            src={track.coverImage}
            alt={track.title}
            className="w-full aspect-square object-cover"
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-[#FF4D67] to-[#FFCB2B] flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </div>
        )}
        {showPlayButton && (
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={handlePlay}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-primary flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
            >
              {currentTrack?.id === track.id && isPlaying ? (
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              )}
            </button>
            {showLikeButton && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite();
                }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
              >
                <svg 
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${isFavorite ? 'text-red-500 fill-current scale-110' : 'stroke-current'}`}
                  fill={isFavorite ? "currentColor" : "none"}
                  stroke="currentColor"
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-bold text-white text-sm sm:text-base mb-1 truncate">
          {track.title}
        </h3>
        <p className="text-gray-400 text-xs sm:text-sm truncate">
          {track.artist}
        </p>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>{track.plays?.toLocaleString() || '0'} plays</span>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
            </svg>
            <span>{track.likes || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}