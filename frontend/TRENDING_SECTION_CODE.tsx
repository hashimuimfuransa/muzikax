// Copy this Trending Now Section and paste after Hero Section in page.tsx
// Replace your existing "For You" section location or create new section

        {/* Modern Trending Now Section */}
        <section className="w-full px-4 md:px-8 py-6 md:py-8">
          <div className="flex items-center justify-between mb-4">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-2xl md:text-3xl lg:text-4xl font-black text-white gradient-text-animated"
            >
              🔥 Trending Now
            </motion.h2>
            <Link
              href="/explore?tab=trending"
              className="text-gold-400 hover:text-gold-300 text-sm md:text-base font-semibold transition-all hover:underline flex items-center gap-1 group"
            >
              View All
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Horizontal Scroll Container */}
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
              {trendingLoading ? (
                // Skeleton loaders
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[280px] md:w-[320px] snap-start">
                    <div className="bg-gray-800/40 rounded-2xl overflow-hidden animate-pulse">
                      <div className="h-64 bg-gray-700/50"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-700/50 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-700/50 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Track cards
                trendingTracks.slice(0, 10).map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-shrink-0 w-[280px] md:w-[320px] snap-start"
                  >
                    <div 
                      onClick={() => {
                        const fullTrack = trendingTracksData.find(t => t._id === track.id);
                        if (fullTrack?.audioURL) {
                          playTrack({
                            id: track.id,
                            title: track.title,
                            artist: track.artist,
                            coverImage: track.coverImage,
                            audioUrl: fullTrack.audioURL,
                            plays: fullTrack.plays || 0,
                            likes: fullTrack.likes || 0,
                            creatorId: typeof fullTrack.creatorId === 'object' && fullTrack.creatorId !== null 
                              ? (fullTrack.creatorId as any)._id 
                              : fullTrack.creatorId,
                            type: fullTrack.type,
                            creatorWhatsapp: (typeof fullTrack.creatorId === 'object' && fullTrack.creatorId !== null 
                              ? (fullTrack.creatorId as any).whatsappContact 
                              : undefined)
                          });
                          const playlistTracks = trendingTracksData
                            .filter(t => t.audioURL)
                            .map(t => ({
                              id: t._id,
                              title: t.title,
                              artist: typeof t.creatorId === "object" && t.creatorId !== null 
                                ? (t.creatorId as any).name 
                                : "Unknown Artist",
                              coverImage: t.coverURL || "",
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
                      }}
                      className="group relative bg-gray-800/40 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:bg-gray-800/60 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {/* Cover Image */}
                      <div className="relative h-64 overflow-hidden">
                        {track.coverImage && track.coverImage.trim() !== '' ? (
                          <img
                            src={track.coverImage}
                            alt={track.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gold-500 to-orange-500 flex items-center justify-center">
                            <svg className="w-20 h-20 text-white/50" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                            </svg>
                          </div>
                        )}
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gold-500 to-orange-500 flex items-center justify-center shadow-glow-primary transform scale-0 group-hover:scale-100 transition-transform duration-300">
                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>

                        {/* Badge */}
                        <div className="absolute top-3 right-3 glass-strong px-3 py-1 rounded-full">
                          <span className="text-xs font-bold text-gold-400">#{index + 1} Trending</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-1 truncate">{track.title}</h3>
                        <p className="text-sm text-gray-400 mb-3 truncate">{track.artist}</p>
                        
                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            <span>{(track.plays / 1000).toFixed(1)}K</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span>{(track.likes / 1000).toFixed(1)}K</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>
