"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaHeart, FaComment, FaFire, FaImage, FaVideo, FaMicrophone } from "react-icons/fa";

interface Vibe {
  id: string;
  userId?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  userName: string;
  userAvatar?: string;
  content: string;
  mediaUrl?: string;
  mediaThumbnail?: string;
  postType: "text" | "image" | "video" | "audio";
  likes: number;
  commentCount: number;
  category?: string;
}

interface TrendingVibesSectionProps {
  limit?: number;
}

export default function TrendingVibesSection({ limit = 5 }: TrendingVibesSectionProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingVibes = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/community/posts/trending?period=week&limit=${limit}`
        );
        if (response.ok) {
          const data = await response.json();
          const processedVibes = data.posts.map((post: any) => ({
            ...post,
            id: post.id || post._id,
            userName: post.userName || post.userId?.name || "Unknown",
            userAvatar: post.userAvatar || post.userId?.avatar,
            userId: post.userId,
            likes: post.likes || 0,
            commentCount: typeof post.comments === "number" ? post.comments : (Array.isArray(post.comments) ? post.comments.length : 0),
            postType: post.postType || "text",
          }));
          setVibes(processedVibes);
        }
      } catch (error) {
        console.error("Error fetching trending vibes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVibes();
  }, [limit]);

  const getVideoFallbackThumbnail = (vibeId: string) => {
    const gradients = [
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    ];
    
    const index = vibeId.charCodeAt(vibeId.length - 1) % gradients.length;
    return gradients[index];
  };

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case "image":
        return <FaImage className="w-3 h-3" />;
      case "video":
        return <FaVideo className="w-3 h-3" />;
      case "audio":
        return <FaMicrophone className="w-3 h-3" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
              🔥 Trending Vibes
            </span>
            <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-[#FFD700]/50 to-transparent hidden sm:block" />
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-[#0a0604] to-[#121821] rounded-2xl border border-[#1F2937] p-4 animate-pulse">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 shadow-md" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-24 mb-2" />
                  <div className="h-3 bg-gray-700 rounded w-16" />
                </div>
              </div>
              <div className="h-32 bg-[#121821] rounded-xl mb-3 shadow-lg" />
              <div className="h-3 bg-[#121821] rounded w-full mb-2" />
              <div className="h-3 bg-[#121821] rounded w-2/3" />
              <div className="flex justify-between items-center pt-3 mt-3 border-t border-[#1F2937]/50">
                <div className="flex space-x-3">
                  <div className="h-7 w-16 bg-[#121821] rounded-full" />
                  <div className="h-7 w-16 bg-[#121821] rounded-full" />
                </div>
                <div className="h-4 w-20 bg-[#121821] rounded" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (vibes.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] bg-clip-text text-transparent">
            🔥 {t('trendingVibes')}
          </span>
          <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-[#FFD700]/50 to-transparent hidden sm:block" />
        </h2>
        <button
          onClick={() => router.push("/community")}
          className="text-xs font-semibold text-white/70 hover:text-[#FFD700] transition-colors uppercase tracking-widest hover:underline decoration-[#FFD700] decoration-2 underline-offset-4"
        >
          {t('viewAll')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {vibes.map((vibe) => {
          const firstLetter = vibe.userName ? vibe.userName.charAt(0).toUpperCase() : "?";
          
          return (
            <button
              key={vibe.id}
              onClick={() => router.push(`/community?postId=${vibe.id}`)}
              className="group flex flex-col bg-gradient-to-br from-[#0a0604] to-[#121821] backdrop-blur-md border border-[#1F2937] rounded-2xl overflow-hidden hover:border-[#F59E0B]/60 hover:shadow-lg hover:shadow-[#F59E0B]/10 transition-all duration-500 text-left relative"
            >
              {/* Animated gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/0 via-[#F59E0B]/0 to-[#F59E0B]/0 group-hover:from-[#F59E0B]/5 group-hover:via-[#F59E0B]/5 group-hover:to-[#F59E0B]/5 transition-all duration-500 pointer-events-none" />
              
              <div className="p-4 flex flex-col h-full relative z-10">
                {/* User Info */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="relative shrink-0">
                    {vibe.userAvatar ? (
                      <img
                        src={vibe.userAvatar}
                        alt={vibe.userName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#F59E0B]/40 group-hover:border-[#F59E0B] transition-all duration-500 shadow-md shadow-black/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F59E0B] via-[#FFB020] to-[#F59E0B] flex items-center justify-center border-2 border-[#F59E0B]/40 group-hover:border-[#F59E0B] transition-all duration-500 shadow-lg shadow-[#F59E0B]/30">
                        <span className="text-black font-bold text-sm">{firstLetter}</span>
                      </div>
                    )}
                    {vibe.postType !== "text" && (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#F59E0B] to-[#FFB020] text-black text-[10px] p-1.5 rounded-full border-2 border-black/20 flex items-center justify-center shadow-lg">
                        {getPostTypeIcon(vibe.postType)}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate group-hover:text-[#F59E0B] transition-colors duration-300">
                      {vibe.userName}
                    </h3>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{t('communityVibe' as any)}</p>
                  </div>
                  {vibe.category === "trending" && (
                    <div className="bg-gradient-to-r from-[#F59E0B] to-[#FFB020] text-black text-[10px] font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-[#F59E0B]/30 whitespace-nowrap">
                      <FaFire className="w-3 h-3" />
                      <span>{t('trending')}</span>
                    </div>
                  )}
                </div>

                {/* Content Preview */}
                <div className="flex-1 mb-4">
                  {vibe.mediaUrl && (vibe.postType === "image" || vibe.postType === "video") ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 shadow-lg shadow-black/40 group-hover:shadow-xl group-hover:shadow-[#F59E0B]/20 transition-all duration-500">
                      {vibe.postType === "image" ? (
                        <img
                          src={vibe.mediaUrl}
                          alt="Vibe media"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          {vibe.mediaThumbnail ? (
                            <img
                              src={vibe.mediaThumbnail}
                              alt="Video thumbnail"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div
                              className="w-full h-full relative"
                              style={{ background: getVideoFallbackThumbnail(vibe.id) }}
                            >
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                  <svg className="w-8 h-8 fill-current text-white" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-all duration-300">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#FFB020] flex items-center justify-center text-black transform group-hover:scale-125 group-hover:shadow-lg group-hover:shadow-[#F59E0B]/50 transition-all duration-300 shadow-lg">
                              <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent"></div>
                    </div>
                  ) : vibe.postType === "audio" ? (
                    <div className="bg-gradient-to-br from-[#121821] to-[#0a0604] rounded-xl p-3 mb-3 flex items-center space-x-3 border border-[#1F2937] group-hover:border-[#10B981]/40 transition-all duration-300">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#10B981]/20 to-[#10B981]/30 flex items-center justify-center text-[#10B981] group-hover:from-[#10B981]/30 group-hover:to-[#10B981]/40 transition-all duration-300 shadow-md">
                        <FaMicrophone className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-gray-300 font-medium">{t('voiceNote' as any)}</span>
                    </div>
                  ) : null}
                  
                  <p className="text-[#9CA3AF] text-sm line-clamp-3 leading-relaxed italic bg-gradient-to-r from-[#121821]/30 to-[#0a0604]/30 p-3 rounded-xl border border-[#1F2937]/30 group-hover:border-[#F59E0B]/20 transition-all duration-300">
                    "{vibe.content}"
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-[#1F2937]/50 text-[#9CA3AF] text-xs mt-auto">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5 group/stat cursor-pointer">
                      <div className="w-7 h-7 rounded-full bg-[#121821] group-hover/stat:bg-[#F59E0B]/20 flex items-center justify-center transition-all duration-300">
                        <FaHeart className="group-hover/stat:text-[#F59E0B] transition-colors text-[10px]" />
                      </div>
                      <span className="font-medium group-hover/stat:text-[#F59E0B] transition-colors">{vibe.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 group/stat cursor-pointer">
                      <div className="w-7 h-7 rounded-full bg-[#121821] group-hover/stat:bg-blue-500/20 flex items-center justify-center transition-all duration-300">
                        <FaComment className="group-hover/stat:text-blue-400 transition-colors text-[10px]" />
                      </div>
                      <span className="font-medium group-hover/stat:text-blue-400 transition-colors">{vibe.commentCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[#F59E0B] font-semibold group-hover:text-[#FFB020] transition-colors duration-300">
                    <span className="text-xs">{t('viewPost' as any)}</span>
                    <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
