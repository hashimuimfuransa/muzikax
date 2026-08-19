"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaHeart, FaComment, FaFire, FaImage, FaVideo, FaMicrophone, FaQuoteLeft } from "react-icons/fa";

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

  // Brand-toned fallbacks — deep charcoal with a warm gold cast, so a missing
  // thumbnail still reads as MuzikaX instead of a random pastel.
  const getVideoFallbackThumbnail = (vibeId: string) => {
    const gradients = [
      "linear-gradient(135deg, #1c1408 0%, #0d0d0d 60%, #241705 100%)",
      "linear-gradient(135deg, #221803 0%, #111111 55%, #14100a 100%)",
      "linear-gradient(135deg, #14100a 0%, #0d0d0d 50%, #2a1c06 100%)",
      "linear-gradient(135deg, #1a1305 0%, #151515 60%, #0d0d0d 100%)",
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

  const sectionHeading = (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <span className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] flex items-center justify-center shadow-lg shadow-[#FF8C00]/20">
        <FaFire className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
      </span>
      <h2 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] bg-clip-text text-transparent">
        {t('trendingVibes')}
      </h2>
    </div>
  );

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between mb-4">{sectionHeading}</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#121212] overflow-hidden animate-pulse">
              <div className="aspect-[4/3] w-full bg-white/[0.04]" />
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div className="w-8 h-8 rounded-full bg-white/[0.06]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-white/[0.06] rounded w-24" />
                  <div className="h-2 bg-white/[0.04] rounded w-16" />
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-white/[0.06] px-3 py-2.5">
                <div className="flex gap-3">
                  <div className="h-3 w-8 bg-white/[0.05] rounded-full" />
                  <div className="h-3 w-8 bg-white/[0.05] rounded-full" />
                </div>
                <div className="h-3 w-14 bg-white/[0.05] rounded" />
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
      <div className="flex items-center justify-between gap-3 mb-4">
        {sectionHeading}
        <button
          onClick={() => router.push("/community")}
          className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-gray-300 hover:text-black hover:bg-gradient-to-r hover:from-[#FFD700] hover:to-[#FF8C00] hover:border-transparent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8C00]"
        >
          {t('viewAll')}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {vibes.map((vibe) => {
          const firstLetter = vibe.userName ? vibe.userName.charAt(0).toUpperCase() : "?";
          const hasMedia = Boolean(vibe.mediaUrl) && (vibe.postType === "image" || vibe.postType === "video");

          return (
            <button
              key={vibe.id}
              onClick={() => router.push(`/community?postId=${vibe.id}`)}
              aria-label={`${t('viewPost' as any)} — ${vibe.userName}`}
              // Block (not flex) layout: the cover's aspect-ratio only resolves
              // reliably when the slot is a normal block box.
              className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-[#121212] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#FF8C00]/40 hover:shadow-xl hover:shadow-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8C00] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {/* Cover — identical footprint on every card, whatever the post type */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0d0d0d]">
                {hasMedia ? (
                  <>
                    {vibe.postType === "image" ? (
                      <img
                        src={vibe.mediaUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <>
                        {vibe.mediaThumbnail ? (
                          <img
                            src={vibe.mediaThumbnail}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0" style={{ background: getVideoFallbackThumbnail(vibe.id) }} />
                        )}
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm ring-1 ring-white/20 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-[#FF8C00] group-hover:text-black group-hover:scale-110">
                          <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      </>
                    )}
                    {/* Caption rides on the artwork, so the card needs no extra row */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent px-3 pb-2.5 pt-10">
                      <p className="line-clamp-2 text-[13px] leading-snug text-white/90">{vibe.content}</p>
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-br from-[#1c1408] via-[#141414] to-[#0d0d0d] px-4 py-5">
                    <FaQuoteLeft className="mb-2.5 w-3.5 h-3.5 shrink-0 text-[#FF8C00]/60" />
                    <p className="line-clamp-4 text-sm leading-relaxed text-gray-200">{vibe.content}</p>
                    {vibe.postType === "audio" && (
                      <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#FF8C00]/15 px-2.5 py-1 text-[11px] font-medium text-[#FFA500]">
                        <FaMicrophone className="w-2.5 h-2.5" />
                        {t('voiceNote' as any)}
                      </span>
                    )}
                  </div>
                )}

                {/* Post type */}
                {vibe.postType !== "text" && (
                  <span className="absolute right-2.5 top-2.5 flex items-center justify-center w-6 h-6 rounded-lg bg-black/55 backdrop-blur-sm text-white ring-1 ring-white/15">
                    {getPostTypeIcon(vibe.postType)}
                  </span>
                )}
              </div>

              {/* Author */}
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                {vibe.userAvatar ? (
                  <img
                    src={vibe.userAvatar}
                    alt=""
                    className="w-8 h-8 shrink-0 rounded-full object-cover ring-1 ring-white/10 transition-all duration-300 group-hover:ring-[#FF8C00]/60"
                  />
                ) : (
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] flex items-center justify-center ring-1 ring-white/10 transition-all duration-300 group-hover:ring-[#FF8C00]/60">
                    <span className="text-black font-bold text-xs">{firstLetter}</span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[13px] font-semibold text-white transition-colors duration-300 group-hover:text-[#FFA500]">
                    {vibe.userName}
                  </h3>
                  <p className="truncate text-[11px] text-gray-500">{t('communityVibe' as any)}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between border-t border-white/[0.06] px-3 py-2.5">
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <FaHeart className="w-3 h-3 text-[#FF8C00]/80" />
                    <span className="font-medium text-gray-400">{vibe.likes}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaComment className="w-3 h-3 text-gray-600" />
                    <span className="font-medium text-gray-400">{vibe.commentCount}</span>
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 transition-colors duration-300 group-hover:text-[#FFA500]">
                  {t('viewPost' as any)}
                  <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
