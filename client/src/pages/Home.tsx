import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import AnimeCard from '../components/AnimeCard';
import GenrePill from '../components/GenrePill';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchAllAnime, fetchEpisodesByAnimeId } from '../lib/api';
import { getRecentlyWatchedAnime, getWatchHistory } from '../lib/cookies';
import { Anime, RecentlyWatchedAnime, WatchHistoryItem } from '@shared/types';
import AnimatedTitle from '../components/AnimatedTitle';
import ScrollReveal from '../components/ScrollReveal';
import TiltCard from '../components/TiltCard';
import ConfettiEffect from '../components/ConfettiEffect';
import LottieLoader from '../components/LottieLoader';
import DefaultSeo from '../components/DefaultSeo';
import { cleanAnimeTitle } from '../utils/titleFormatter';

// Animation variants for sections
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// Optimized skeleton loader for better performance
const OptimizedSkeletonLoader = ({ count = 3 }: { count?: number }) => {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden bg-dark-800/60 shadow-md border border-dark-700/30">
          <Skeleton className="aspect-[2/3] w-full rounded-t-xl animate-pulse" />
          <div className="p-3">
            <Skeleton className="h-4 w-3/4 mb-2 rounded-md animate-pulse" />
          </div>
        </div>
      ))}
    </>
  );
};

// Section title component for consistent styling
const SectionTitle = ({ icon, title, viewAllLink, viewAllText = 'View All' }: { 
  icon: string, 
  title: string, 
  viewAllLink?: string,
  viewAllText?: string 
}) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-center justify-between mb-6"
  >
    <h2 className="text-2xl font-bold flex items-center bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
      <i className={`fas fa-${icon} mr-2.5 text-primary`}></i> {title}
    </h2>
    {viewAllLink && (
      <Link href={viewAllLink}>
        <span className="text-sm bg-primary text-white py-2 px-4 rounded-full hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all duration-300 font-medium flex items-center cursor-pointer hover:translate-x-1 hover:shadow-primary/40 transform hover:scale-105 font-bold">
          {viewAllText} <i className="fas fa-chevron-right ml-1.5 text-xs animate-pulse"></i>
        </span>
      </Link>
    )}
  </motion.div>
);

const Home = () => {
  const [continueWatching, setContinueWatching] = useState<WatchHistoryItem[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<RecentlyWatchedAnime[]>([]);
  const location = useLocation();
  const setLocation = location[1];

  const { data: animeList, isLoading: isLoadingAnime } = useQuery({
    queryKey: ['/api/anime'],
    queryFn: () => fetchAllAnime(),
  });

  const { data: episodeCounts } = useQuery({
    queryKey: ['/api/episodes/counts'],
    queryFn: async () => {
      if (!animeList) return {};
      const counts: Record<number, number> = {};

      await Promise.all(
        animeList.slice(0, 12).map(async (anime) => {
          try {
            const episodes = await fetchEpisodesByAnimeId(anime.id.toString());
            counts[anime.id] = episodes.length;
          } catch (error) {
            console.error(`Error fetching episodes for anime ${anime.id}:`, error);
            counts[anime.id] = 0;
          }
        })
      );

      return counts;
    },
    enabled: !!animeList,
  });

  useEffect(() => {
    const history = getWatchHistory();
    const recents = getRecentlyWatchedAnime();
    const uniqueAnimeMap = new Map<string, WatchHistoryItem>();

    history.forEach(item => {
      if (!uniqueAnimeMap.has(item.animeId) || 
          uniqueAnimeMap.get(item.animeId)!.timestamp < item.timestamp) {
        uniqueAnimeMap.set(item.animeId, item);
      }
    });

    const uniqueHistory = Array.from(uniqueAnimeMap.values())
      .sort((a, b) => b.timestamp - a.timestamp);

    setContinueWatching(uniqueHistory);
    setRecentlyWatched(recents);
  }, []);

  const extractGenres = () => {
    if (!animeList) return [];
    const genreArrays = animeList.map(anime => 
      anime.genre.split(',').map(g => g.trim())
    );
    const uniqueGenresSet = new Set(genreArrays.flat());
    return Array.from(uniqueGenresSet).sort((a, b) => a.localeCompare(b));
  };

  const genres = extractGenres();
  
  // Filter anime based on tags in titles and sort by rank if available
  const trendingAnime = useMemo(() => {
    if (!animeList) return [];
    
    // Find anime with trending tag (T)
    const trending = animeList.filter(anime => anime.title.includes('(T)'));
    
    // Sort by rank if possible
    return trending.sort((a, b) => {
      // Try to extract ranking numbers from titles
      const aMatch = a.title.match(/\(T\)-\((\d+)\)/);
      const bMatch = b.title.match(/\(T\)-\((\d+)\)/);
      
      // If both have ranking numbers, sort by them
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      
      // If only one has a ranking number, prioritize the one with ranking
      if (aMatch) return -1;
      if (bMatch) return 1;
      
      // Otherwise keep original order
      return 0;
    });
  }, [animeList]);
  
  const latestReleasedAnime = useMemo(() => {
    if (!animeList) return [];
    
    // Find anime with latest released tag (LR)
    const latest = animeList.filter(anime => anime.title.includes('(LR)'));
    
    // Sort by rank if possible
    return latest.sort((a, b) => {
      // Try to extract ranking numbers from titles
      const aMatch = a.title.match(/\(LR\)-\((\d+)\)/);
      const bMatch = b.title.match(/\(LR\)-\((\d+)\)/);
      
      // If both have ranking numbers, sort by them
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      
      // If only one has a ranking number, prioritize the one with ranking
      if (aMatch) return -1;
      if (bMatch) return 1;
      
      // Otherwise keep original order
      return 0;
    });
  }, [animeList]);
  
  const popularAnime = useMemo(() => {
    if (!animeList) return [];
    
    // Find anime with popular tag (P)
    const popular = animeList.filter(anime => anime.title.includes('(P)'));
    
    // Sort by rank if possible
    return popular.sort((a, b) => {
      // Try to extract ranking numbers from titles
      const aMatch = a.title.match(/\(P\)-\((\d+)\)/);
      const bMatch = b.title.match(/\(P\)-\((\d+)\)/);
      
      // If both have ranking numbers, sort by them
      if (aMatch && bMatch) {
        return parseInt(aMatch[1]) - parseInt(bMatch[1]);
      }
      
      // If only one has a ranking number, prioritize the one with ranking
      if (aMatch) return -1;
      if (bMatch) return 1;
      
      // Otherwise keep original order
      return 0;
    });
  }, [animeList]);
  
  // All Anime section should contain all anime
  const allAnime = useMemo(() => {
    if (!animeList) return [];
    return animeList; // No filtering, show all anime
  }, [animeList]);
  
  // Use the filtered anime for each section
  const finalTrendingAnime = trendingAnime;
  const finalLatestReleasedAnime = latestReleasedAnime;
  const finalPopularAnime = popularAnime;
  const finalAllAnime = allAnime;

  const handleQuickPlay = (animeId: string) => {
    const anime = animeList?.find(a => a.id.toString() === animeId);
    if (anime) {
      setLocation(`/watch/${animeId}/1`); 
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800 pb-24 md:pb-8">
      {/* SEO Metadata */}
      <DefaultSeo />
      
      {/* Animated gradient background for smooth visual experience */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-dark-950 via-dark-900/90 to-[#1a103a] opacity-80 animate-gradient-slow bg-size-200"></div>
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent blur-3xl"></div>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Welcome Banner with AnimatedTitle */}
        <ScrollReveal>
          <div className="mb-8 text-center">
            <AnimatedTitle 
              text="Welcome to 9Anime"
              animation="gradient"
              className="text-4xl md:text-5xl font-bold mb-3"
            />
            <p className="text-slate-300 max-w-2xl mx-auto">
              Discover and stream your favorite anime with enhanced visual experience
            </p>
          </div>
        </ScrollReveal>
        
        {continueWatching.length > 0 && (
          <motion.section 
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
            className="mb-8 md:mb-12 backdrop-blur-sm bg-dark-900/30 p-6 rounded-2xl border border-primary/10 relative overflow-hidden"
          >
            {/* Background animation effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-50"></div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

            <div className="relative">
              <AnimatedTitle 
                text="Continue Watching"
                animation="typewriter"
                className="text-2xl font-bold mb-6 flex items-center"
                tag="h2"
              >
                <i className="fas fa-history ml-3 text-primary"></i>
              </AnimatedTitle>

              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
                {continueWatching.slice(0, 8).map((item, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={`${item.animeId}-${item.episodeId}`}
                    className="transform transition-transform duration-300 hover:scale-105"
                  >
                    <AnimeCard
                      anime={{
                        id: parseInt(item.animeId),
                        title: item.animeTitle,
                        thumbnail_url: item.animeThumbnail,
                        genre: "",
                        description: ""
                      }}
                      showProgress={true}
                      progress={item.progress}
                      onQuickPlay={() => setLocation(`/watch/${item.animeId}/${item.episodeId}`)}
                      className="continue-watching-card" 
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* Trending Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="mb-12 backdrop-blur-sm bg-dark-900/30 p-6 rounded-2xl border border-white/5"
        >
          <SectionTitle 
            icon="chart-line" 
            title="Trending" 
            viewAllLink="/category/trending" 
          />

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {isLoadingAnime ? (
              <OptimizedSkeletonLoader count={6} />
            ) : (
              finalTrendingAnime.slice(0, 6).map((anime, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={anime.id}
                >
                  <AnimeCard 
                    anime={{
                      ...anime,
                      title: cleanAnimeTitle(anime.title)
                    }}
                    rating={4.8} 
                    episodeCount={episodeCounts?.[anime.id] || undefined}
                    onQuickPlay={() => handleQuickPlay(anime.id.toString())}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.section>
        
        {/* Latest Released Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="mb-12 backdrop-blur-sm bg-dark-900/30 p-6 rounded-2xl border border-white/5"
        >
          <SectionTitle 
            icon="clock" 
            title="Latest Released" 
            viewAllLink="/category/recent" 
          />

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {isLoadingAnime ? (
              <OptimizedSkeletonLoader count={6} />
            ) : (
              finalLatestReleasedAnime.slice(0, 6).map((anime, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={anime.id}
                >
                  <AnimeCard 
                    anime={{
                      ...anime,
                      title: cleanAnimeTitle(anime.title)
                    }}
                    rating={4.6} 
                    episodeCount={episodeCounts?.[anime.id] || undefined}
                    onQuickPlay={() => handleQuickPlay(anime.id.toString())}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.section>
        
        {/* Popular Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="mb-12 backdrop-blur-sm bg-dark-900/30 p-6 rounded-2xl border border-white/5"
        >
          <SectionTitle 
            icon="fire" 
            title="Popular Now" 
            viewAllLink="/category/popular" 
          />

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {isLoadingAnime ? (
              <OptimizedSkeletonLoader count={6} />
            ) : (
              finalPopularAnime.slice(0, 6).map((anime, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={anime.id}
                >
                  <AnimeCard 
                    anime={{
                      ...anime,
                      title: cleanAnimeTitle(anime.title)
                    }}
                    rating={4.5} 
                    episodeCount={episodeCounts?.[anime.id] || undefined}
                    onQuickPlay={() => handleQuickPlay(anime.id.toString())}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* All Anime Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="mb-12 backdrop-blur-sm bg-dark-900/30 p-6 rounded-2xl border border-white/5"
        >
          <SectionTitle 
            icon="film" 
            title="All Anime" 
            viewAllLink="/category/all" 
          />

          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {isLoadingAnime ? (
              <OptimizedSkeletonLoader count={6} />
            ) : (
              finalAllAnime.slice(0, 6).map((anime: Anime, index: number) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={anime.id}
                >
                  <AnimeCard 
                    anime={{
                      ...anime,
                      title: cleanAnimeTitle(anime.title)
                    }}
                    rating={4.2} 
                    episodeCount={episodeCounts?.[anime.id] || undefined}
                    onQuickPlay={() => handleQuickPlay(anime.id.toString())}
                    className="hover:scale-105 transition-transform duration-300"
                  />
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        {/* Browse by Genre Section */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="mb-12 backdrop-blur-sm bg-dark-900/30 p-6 rounded-2xl border border-white/5"
        >
          <SectionTitle 
            icon="tags" 
            title="Browse by Genre" 
            viewAllLink="/genre/all" 
            viewAllText="All Genres"
          />

          <div className="mb-4 overflow-x-auto pb-2 -mx-4 px-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-nowrap gap-2 min-w-max"
            >
              {isLoadingAnime ? (
                Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-24 rounded-full animate-pulse" />
                ))
              ) : (
                genres.slice(0, 20).map((genre, index) => (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={genre}
                  >
                    <GenrePill genre={genre} />
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>

          <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
            {isLoadingAnime ? (
              Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl animate-pulse" />
              ))
            ) : (
              genres.slice(0, 12).map((genre, index) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  key={genre}
                >
                  <Link href={`/genre/${encodeURIComponent(genre)}`}>
                    <span className="bg-dark-800/70 hover:bg-dark-800 transition-all duration-300 py-4 px-2 rounded-xl shadow-md border border-dark-700/50 hover:border-primary/20 flex items-center justify-center group cursor-pointer hover:scale-105">
                      <i className="fas fa-tag mr-2 text-primary/70 group-hover:text-primary transition-colors duration-300"></i>
                      <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors duration-300">{genre}</span>
                    </span>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;