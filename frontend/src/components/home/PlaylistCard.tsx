"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import { getUserPlaylists } from "../../services/userService";

interface Track {
  _id: string;
  title: string;
  coverURL?: string;
  coverImage?: string;
}

interface PlaylistCardProps {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  tracks: number;
}

export default function PlaylistCard({ playlist }: { playlist: PlaylistCardProps }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch playlist tracks to show multiple thumbnails
  useEffect(() => {
    const fetchPlaylistTracks = async () => {
      try {
        setLoading(true);
        const playlists = await getUserPlaylists();
        const foundPlaylist = playlists.find((p: any) => p._id === playlist.id);
        
        if (foundPlaylist && foundPlaylist.tracks) {
          // Get first 4 tracks for thumbnail display
          setPlaylistTracks(foundPlaylist.tracks.slice(0, 4));
        }
      } catch (error) {
        console.error('Error fetching playlist tracks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylistTracks();
  }, [playlist.id]);

  const getTrackCover = (track: Track) => {
    return track.coverURL || track.coverImage || '';
  };

  return (
    <button
      onClick={() => router.push(`/playlists/${playlist.id}`)}
      className="group flex items-center gap-3 px-3 py-3 w-full hover:bg-gradient-to-br hover:from-[#F59E0B]/10 hover:to-[#FFB020]/10 transition-all duration-300 text-left relative overflow-hidden border-l-2 border-transparent hover:border-[#F59E0B] bg-[#0a0604] rounded-xl"
    >
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/10 to-[#FFB020]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative shrink-0">
        {/* Multiple track thumbnails grid */}
        <div className="w-16 h-16 grid grid-cols-2 grid-rows-2 gap-px rounded-lg overflow-hidden shadow-lg group-hover:shadow-[#F59E0B]/40 transition-shadow duration-300 bg-gray-800">
          {playlistTracks.length > 0 ? (
            playlistTracks.map((track, idx) => (
              <div key={idx} className="relative overflow-hidden bg-gray-900">
                {getTrackCover(track) ? (
                  <img
                    src={getTrackCover(track)}
                    alt={`Track ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1A2330] to-[#121821] flex items-center justify-center">
                    <svg className="w-3 h-3 text-[#6B7280]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
                    </svg>
                  </div>
                )}
              </div>
            ))
          ) : (
            /* Fallback to single cover if no tracks loaded */
            <div className="col-span-2 row-span-2 relative overflow-hidden">
              {playlist.coverImage ? (
                <img
                  src={playlist.coverImage}
                  alt={playlist.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1A2330] to-[#121821] border border-[#1F2937] flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#6B7280]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm4 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Track count badge with Modern Style */}
        {playlist.tracks > 0 && (
          <div className="absolute -bottom-1 -right-1 bg-[#F59E0B] text-black text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md shadow-[#F59E0B]/30 min-w-[18px] text-center">
            {playlist.tracks}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-sm font-semibold text-white group-hover:text-[#F5DEB3] transition-colors truncate">
          {playlist.title}
        </p>
        <p className="text-xs text-[#9CA3AF] group-hover:text-[#F5DEB3] transition-colors truncate">
          {playlist.artist} · {t('tracksCount', { count: playlist.tracks })}
        </p>
      </div>
    </button>
  );
}
