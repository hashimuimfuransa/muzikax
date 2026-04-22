"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAudioPlayer } from "../../contexts/AudioPlayerContext";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  getGlobalCharts,
  getCountryCharts,
  getGenreCharts,
  getTrendingTracks,
  type ChartTrack,
  type TimeWindow,
} from "../../services/chartService";
import ChartTrackCard from "../../components/ChartTrackCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useWebSocket } from "../../hooks/useWebSocket";
import { FaArrowLeft } from "react-icons/fa";

type ChartType = "global" | "country" | "genre" | "trending";
type CountryCode = "RW" | "US" | "KE" | "TZ" | "UG" | "NG" | "GH" | "ZA";

const COUNTRIES: { code: CountryCode; name: string }[] = [
  { code: "RW", name: "Rwanda" },
  { code: "US", name: "United States" },
  { code: "KE", name: "Kenya" },
  { code: "TZ", name: "Tanzania" },
  { code: "UG", name: "Uganda" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "ZA", name: "South Africa" },
];

const GENRES = [
  "Afrobeat",
  "Hip Hop",
  "R&B",
  "Amapiano",
  "Dancehall",
  "Afropop",
  "Gospel",
  "Traditional",
];

export default function ChartsPage() {
  const router = useRouter();
  const { t } = useLanguage()
  const [chartType, setChartType] = useState<ChartType>("global");
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("weekly");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("RW");
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);
  const [charts, setCharts] = useState<ChartTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const { playTrack, setCurrentPlaylist } = useAudioPlayer();
  
  // WebSocket for real-time updates
  const { isConnected, latestUpdate } = useWebSocket(chartType);

  useEffect(() => {
    fetchCharts();
  }, [chartType, timeWindow, selectedCountry, selectedGenre]);

  // Handle real-time chart updates
  useEffect(() => {
    if (latestUpdate) {
      console.log('📡 Received real-time chart update:', latestUpdate);
      // Optionally refresh charts or show notification
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-[#FF8C00] text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = 'Charts updated in real-time! 🎵';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }
  }, [latestUpdate]);

  const fetchCharts = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      switch (chartType) {
        case "global":
          response = await getGlobalCharts(timeWindow, 50);
          break;
        case "country":
          response = await getCountryCharts(selectedCountry, timeWindow, 50);
          break;
        case "genre":
          response = await getGenreCharts(selectedGenre, timeWindow, 50);
          break;
        case "trending":
          response = await getTrendingTracks(50);
          break;
      }

      if (response && 'charts' in response) {
        setCharts(response.charts as ChartTrack[]);
        if ('updatedAt' in response) {
          setLastUpdated(response.updatedAt || new Date().toISOString());
        } else {
          setLastUpdated(new Date().toISOString());
        }
      }
    } catch (err) {
      console.error("Error fetching charts:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load charts. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrack = (track: ChartTrack, index: number) => {
    playTrack({
      id: track._id,
      title: track.title,
      artist:
        typeof track.creatorId === "object" && track.creatorId !== null
          ? (track.creatorId as any).name
          : "Unknown Artist",
      coverImage: track.coverURL || "/placeholder-playlist.png",
      audioUrl: track.audioURL,
      creatorId:
        typeof track.creatorId === "object" && track.creatorId !== null
          ? (track.creatorId as any)._id
          : undefined,
    });

    // Set playlist to all chart tracks
    const playlistTracks = charts.map((t) => ({
      id: t._id,
      title: t.title,
      artist:
        typeof t.creatorId === "object" && t.creatorId !== null
          ? (t.creatorId as any).name
          : "Unknown Artist",
      coverImage: t.coverURL || "/placeholder-playlist.png",
      audioUrl: t.audioURL,
      creatorId:
        typeof t.creatorId === "object" && t.creatorId !== null
          ? (t.creatorId as any)._id
          : undefined,
    }));

    setCurrentPlaylist(playlistTracks);
  };

  const getRankIcon = (currentRank: number, previousRank: number) => {
    const diff = previousRank - currentRank;
    if (diff > 0) return { icon: "↑", color: "text-green-500", label: "Up" };
    if (diff < 0) return { icon: "↓", color: "text-red-500", label: "Down" };
    return { icon: "→", color: "text-gray-500", label: "Same" };
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-white pb-20 md:pb-12">
      {/* Back Button & Title Header */}
      <div className="sticky top-0 z-40 bg-[var(--card-bg)] backdrop-blur-xl border-b border-white/10">
        <div className="px-4 md:px-8 py-3 md:py-4">
          {/* Back Button Row */}
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-all active:scale-95 min-h-[44px] px-3 py-2 rounded-lg hover:bg-gray-800/50"
              aria-label="Go back"
            >
              <FaArrowLeft className="text-lg" />
              <span className="text-sm font-medium hidden md:inline">Back</span>
            </button>
          </div>
          
          {/* Title */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold">{t('charts')} Charts</h1>
            <p className="text-xs md:text-sm text-gray-400 hidden md:block">
              Discover trending tracks
            </p>
          </div>
        </div>
      </div>

      {/* Controls - Mobile Responsive */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
        {/* Chart Type Tabs - Scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-2">
          {(["global", "country", "genre", "trending"] as ChartType[]).map(
            (type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-4 py-2 rounded-lg font-medium capitalize whitespace-nowrap transition-all text-sm md:text-base flex-shrink-0 ${
                  chartType === type
                    ? "bg-[#FF8C00] text-white"
                    : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {type === 'global' ? 'Global' : type === 'country' ? 'Country' : type === 'genre' ? 'Genre' : 'Trending'}
              </button>
            )
          )}
        </div>

        {/* Time Window & Selectors Row */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Time Window Selector (not for trending) */}
          {chartType !== "trending" && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto pb-2 md:pb-0">
              {(["daily", "weekly", "monthly"] as TimeWindow[]).map(
                (window) => (
                  <button
                    key={window}
                    onClick={() => setTimeWindow(window)}
                    className={`px-3 py-1.5 rounded-md text-xs md:text-sm font-medium capitalize transition-all whitespace-nowrap ${
                      timeWindow === window
                        ? "bg-white text-[#FF8C00]"
                        : "bg-gray-800/50 text-gray-400 hover:text-white"
                    }`}
                  >
                    {window}
                  </button>
                )
              )}
            </div>
          )}

          {/* Country/Genre Selectors */}
          <div className="flex gap-4 w-full md:w-auto">
            {chartType === "country" && (
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value as CountryCode)}
                className="bg-gray-800/50 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#FF8C00] focus:outline-none w-full md:w-auto text-sm md:text-base appearance-none cursor-pointer active:scale-95 transition-transform"
                style={{ minHeight: '44px' }}
              >
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            )}

            {chartType === "genre" && (
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-gray-800/50 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-[#FF8C00] focus:outline-none w-full md:w-auto text-sm md:text-base appearance-none cursor-pointer active:scale-95 transition-transform"
                style={{ minHeight: '44px' }}
              >
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Last Updated - Mobile friendly */}
        <div className="mt-4 text-xs md:text-sm text-gray-400">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      </div>

      {/* Charts Content - Mobile Responsive */}
      <div className="max-w-7xl mx-auto px-4 pb-12 md:pb-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 md:p-6 text-center">
            <p className="text-red-400 text-sm md:text-base">{error}</p>
            <button
              onClick={fetchCharts}
              className="mt-4 px-6 py-2.5 bg-red-500 hover:bg-red-600 rounded-lg transition-colors text-sm md:text-base min-h-[44px]"
            >
              Try Again
            </button>
          </div>
        ) : charts.length === 0 ? (
          <div className="text-center py-20 px-4">
            <p className="text-gray-400 text-sm md:text-base">No charts available</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {charts.map((track, index) => {
              const rankInfo = getRankIcon(track.rank, track.previousRank || 0);
              return (
                <ChartTrackCard
                  key={track._id}
                  track={track}
                  rank={track.rank}
                  rankChange={rankInfo}
                  onPlay={() => handlePlayTrack(track, index)}
                  isPlaying={false}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
