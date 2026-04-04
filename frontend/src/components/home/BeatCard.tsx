"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";

interface BeatCardProps {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  plays: number;
  likes: number;
  audioUrl: string;
  type?: 'song' | 'beat' | 'mix';
  paymentType?: 'free' | 'paid';
  price?: number;
  currency?: string;
  creatorId?: string;
}

export default function BeatCard({ 
  beat, 
  onPlay, 
  isActive 
}: { 
  beat: BeatCardProps; 
  onPlay: () => void;
  isActive: boolean;
}) {
  const router = useRouter();
  const { t } = useLanguage();

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return t('free');
    return `${currency || '$'}${price.toFixed(2)}`;
  };

  return (
    <button
      onClick={onPlay}
      className={`group flex flex-col gap-3 p-3 rounded-2xl transition-all duration-300 text-left w-full active:scale-[0.98] relative overflow-hidden ${
        isActive 
          ? "bg-[#1A2330] ring-2 ring-[#F59E0B] shadow-lg shadow-[#F59E0B]/30" 
          : "bg-[#0a0604] hover:bg-[#121821] border border-[#1F2937] hover:border-[#374151]"
      }`}
    >
      {/* Animated gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/10 via-[#FFB020]/10 to-[#F59E0B]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl group-hover:shadow-[#F59E0B]/30 transition-all duration-300">
        {beat.coverImage ? (
          <img
            src={beat.coverImage}
            alt={beat.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1A2330] to-[#121821] flex items-center justify-center border border-[#1F2937]">
            <svg className="w-12 h-12 text-[#6B7280]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </div>
        )}
      
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        
        {/* Payment type badge with Modern Style */}
        <div className="absolute top-2 left-2 flex gap-1">
          {beat.paymentType && (
            beat.paymentType === 'paid' ? (
              <div className="px-2.5 py-1 bg-[#F59E0B] text-black text-xs font-bold rounded-full shadow-lg shadow-[#F59E0B]/30 backdrop-blur-sm">
                {formatPrice(beat.price, beat.currency)}
              </div>
            ) : (
              <div className="px-2.5 py-1 bg-[#10B981] text-white text-xs font-bold rounded-full shadow-lg shadow-[#10B981]/30 backdrop-blur-sm">
                {t('free')}
              </div>
            )
          )}
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-14 h-14 bg-[#F59E0B] rounded-full flex items-center justify-center shadow-lg shadow-[#F59E0B]/30 transform scale-50 group-hover:scale-100 transition-all duration-300 hover:scale-110">
            <svg className="w-6 h-6 text-black ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
        
        {isActive && (
          <div className="absolute top-2 right-2 px-2.5 py-1 bg-[#F59E0B] text-black text-xs font-bold rounded-full shadow-lg animate-pulse">
            ▶ {t('nowPlaying')}
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <p className={`text-sm font-semibold truncate ${isActive ? "text-[#F59E0B]" : "text-white group-hover:text-white"}`}>
          {beat.title}
        </p>
        <p className="text-xs text-[#9CA3AF] truncate mt-0.5 group-hover:text-[#F5DEB3] transition-colors">{beat.artist}</p>
      </div>
    </button>
  );
}
