import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import GenrePill from '../components/GenrePill';
import EpisodeCard from '../components/EpisodeCard';
import { fetchAnimeById, fetchEpisodesByAnimeId } from '../lib/api';
import { updateRecentlyWatchedAnime } from '../lib/cookies';
import ParticleBackground from '../components/ParticleBackground';
import AnimatedTitle from '../components/AnimatedTitle';
import ScrollReveal from '../components/ScrollReveal';
import AnimeLazyImage from '../components/AnimeLazyImage';
import ParallaxSection from '../components/ParallaxSection';
import TiltCard from '../components/TiltCard';
import SmoothScroll from '../components/SmoothScroll';
import { cleanAnimeTitle } from '../utils/titleFormatter';

const AnimeDetails = () => {
  const [, params] = useRoute('/anime/:id');
  const animeId = params?.id || '';

  // Fetch anime details
  const { data: anime, isLoading: isLoadingAnime, isError: isAnimeError } = useQuery({
    queryKey: ['/api/anime', animeId],
    queryFn: () => fetchAnimeById(animeId),
    enabled: !!animeId,
  });

  // Fetch anime episodes
  const { data: episodes, isLoading: isLoadingEpisodes, isError: isEpisodesError } = useQuery({
    queryKey: ['/api/episodes', animeId],
    queryFn: () => fetchEpisodesByAnimeId(animeId),
    enabled: !!animeId,
  });

  // Update recently watched when visiting anime details
  useEffect(() => {
    if (anime) {
      updateRecentlyWatchedAnime({
        id: anime.id.toString(),
        title: cleanAnimeTitle(anime.title), // Remove tags from title using shared utility
        thumbnail_url: anime.thumbnail_url,
        genre: anime.genre,
        timestamp: new Date().getTime()
      });
    }
  }, [anime]);

  // Handle loading state
  if (isLoadingAnime || isLoadingEpisodes) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Skeleton className="h-[300px] md:h-[400px] w-full rounded-lg mb-4" />
        <div className="flex flex-col md:flex-row gap-6 mt-4">
          <Skeleton className="w-40 md:w-60 h-[300px] rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isAnimeError || !anime) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Anime not found</h1>
        <p className="mb-4">We couldn't find the anime you're looking for.</p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  // Extract genres from comma-separated string
  const genres = anime.genre.split(',').map(g => g.trim());

  // Get first episode thumbnail for banner
  const bannerImage = episodes && episodes.length > 0
    ? episodes[0].thumbnail_url
    : anime.thumbnail_url;
    
  // Clean anime title for display
  const cleanedTitle = cleanAnimeTitle(anime.title);
  
  // Format structured data for this anime
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": cleanedTitle,
    "description": anime.description,
    "image": anime.thumbnail_url,
    "genre": genres,
    "url": `https://9anime.fun/anime/${anime.id}`,
    "potentialAction": {
      "@type": "WatchAction",
      "target": `https://9anime.fun/anime/${anime.id}`
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": "324"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-950 to-dark-800">
      <Helmet>
        <title>{cleanedTitle} | Watch on 9Anime.fun</title>
        <meta name="description" content={`Watch ${cleanedTitle} online for free in HD quality. ${anime.description.substring(0, 150)}...`} />
        <meta name="keywords" content={`${cleanedTitle}, watch ${cleanedTitle}, ${genres.join(', ')}, 9anime, anime streaming, anime online`} />
        <link rel="canonical" href={`https://9anime.fun/anime/${anime.id}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="video.tv_show" />
        <meta property="og:title" content={`${cleanedTitle} | Watch on 9Anime.fun`} />
        <meta property="og:description" content={anime.description.substring(0, 200) + '...'} />
        <meta property="og:image" content={anime.thumbnail_url} />
        <meta property="og:url" content={`https://9anime.fun/anime/${anime.id}`} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${cleanedTitle} | Watch on 9Anime.fun`} />
        <meta name="twitter:description" content={anime.description.substring(0, 200) + '...'} />
        <meta name="twitter:image" content={anime.thumbnail_url} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      
      <ParticleBackground 
        options={{
          particles: {
            number: { value: 30 },
            color: { value: "#4a3aff" },
            opacity: { value: 0.2 },
            size: { value: 2 },
            move: { speed: 0.3 }
          }
        }}
      />
      {/* Hero section with enhanced parallax banner */}
      <div
        className="relative h-[300px] md:h-[400px] overflow-hidden group"
      >
        <img
          src={bannerImage}
          alt={anime.title}
          className="w-full h-full object-cover object-center opacity-75 transform-gpu will-change-transform transition-all duration-700 ease-in-out group-hover:scale-105 group-hover:opacity-85"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent/30">
          {/* Animated neon lines */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse"></div>
          <div className="absolute -bottom-4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-pulse delay-75"></div>
        </div>
        <Link href="/">
          <button className="absolute top-4 left-4 bg-dark-800/80 hover:bg-dark-700 transition-all duration-300 p-2 rounded-full text-white hover:shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] hover:text-primary transform hover:scale-110">
            <i className="fas fa-arrow-left"></i>
          </button>
        </Link>
      </div>

      {/* Anime info section */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row gap-6"
        >
          {/* Anime poster with basic effect */}
          <div className="w-40 md:w-60 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-lg ring-1 ring-white/10 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all duration-300 group">
            <img
              src={anime.thumbnail_url}
              alt={anime.title}
              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
            />
          </div>

          {/* Anime details */}
          <div className="flex-1 backdrop-blur-sm bg-dark-900/30 p-6 rounded-2xl border border-white/5">
            <AnimatedTitle
              text={cleanAnimeTitle(anime.title)}
              className="text-2xl md:text-4xl font-bold mb-2 hover:scale-[1.01] transition-transform duration-300"
              gradient="from-primary via-white to-primary"
              delay={0.1}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2 mb-3"
            >
              {genres.map((genre, index) => (
                <motion.div
                  key={genre}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GenrePill genre={genre} />
                </motion.div>
              ))}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-slate-300 mb-6 leading-relaxed"
            >
              {anime.description}
            </motion.p>

            {episodes && episodes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-3"
              >
                <Link href={`/watch/${anime.id}/${episodes[0].id}`}>
                  <button className="bg-primary hover:bg-primary/90 transition-all duration-300 px-8 py-3 rounded-full flex items-center hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] transform hover:scale-105 group">
                    <i className="fas fa-play mr-2 group-hover:animate-pulse"></i>
                    <span className="font-medium">Watch First Episode</span>
                  </button>
                </Link>
                
                <SmoothScroll
                  to="episodes"
                  duration={800}
                  offset={30}
                  mobileOffset={60} 
                  className="bg-dark-800 hover:bg-dark-700 transition-all duration-300 px-8 py-3 rounded-full flex items-center hover:shadow-lg transform hover:scale-105 group border border-primary/30"
                >
                  <i className="fas fa-list mr-2 group-hover:animate-pulse"></i>
                  <span className="font-medium">View Episodes</span>
                </SmoothScroll>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Episodes section */}
        <motion.div
          id="episodes"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 backdrop-blur-sm bg-dark-900/30 p-6 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all duration-300"
        >
          <ScrollReveal>
            <AnimatedTitle
              text="Episodes"
              className="text-xl font-bold mb-6 relative inline-block"
              tag="h2"
              animation="gradient"
              gradient="from-primary to-white"
              delay={0.1}
            />
            <div className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </ScrollReveal>

          {isLoadingEpisodes ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          ) : isEpisodesError || !episodes ? (
            <p className="text-slate-400">Failed to load episodes.</p>
          ) : !Array.isArray(episodes) ? (
            <p className="text-slate-400">Episode data is not in the expected format.</p>
          ) : episodes.length === 0 ? (
            <p className="text-slate-400">No episodes available for this anime.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {episodes.map((episode, index) => (
                <ScrollReveal key={episode.id} delay={index * 0.05}>
                  <div className="transform transition-all duration-300 hover:scale-[1.02]">
                    <EpisodeCard
                      episode={episode}
                      animeId={anime.id.toString()}
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AnimeDetails;