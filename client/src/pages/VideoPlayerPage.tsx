import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '../lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Skeleton } from '@/components/ui/skeleton';
import TestFluidPlayer from '../components/TestFluidPlayer'; 
import { fetchAnimeById, fetchEpisodeById, fetchEpisodesByAnimeId } from '../lib/api';
import { updateWatchHistory, updateRecentlyWatchedAnime } from '../lib/cookies';
import { Episode } from '@shared/types';
import { cleanAnimeTitle } from '../utils/titleFormatter';

const VideoPlayerPage = () => {
  const [, params] = useRoute('/watch/:animeId/:episodeId');
  const [, setLocation] = useLocation();

  const animeId = params?.animeId || '';
  const episodeId = params?.episodeId || '';

  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState<number>(-1);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  // Fetch anime details
  const { data: anime, isLoading: isLoadingAnime } = useQuery({
    queryKey: ['/api/anime', animeId],
    queryFn: () => fetchAnimeById(animeId),
    enabled: !!animeId,
  });

  // Fetch current episode
  const { data: currentEpisode, isLoading: isLoadingEpisode } = useQuery({
    queryKey: ['/api/episodes', episodeId],
    queryFn: () => fetchEpisodeById(episodeId),
    enabled: !!episodeId,
  });

  // Fetch all episodes for the anime
  const { data: allEpisodes } = useQuery({
    queryKey: ['/api/episodes', animeId, 'all'],
    queryFn: () => fetchEpisodesByAnimeId(animeId),
    enabled: !!animeId,
  });

  useEffect(() => {
    if (allEpisodes) {
      // Sort episodes by episode number
      const sortedEpisodes = [...allEpisodes].sort((a, b) => a.episode_number - b.episode_number);
      setEpisodes(sortedEpisodes);

      // Find index of current episode
      const index = sortedEpisodes.findIndex(ep => ep.id.toString() === episodeId);
      setCurrentEpisodeIndex(index);
    }
  }, [allEpisodes, episodeId]);

  // Update watch history and recently watched when playing an episode
  useEffect(() => {
    if (anime && currentEpisode) {
      // Update watch history
      updateWatchHistory({
        animeId: animeId,
        episodeId: episodeId,
        title: currentEpisode.title,
        episodeNumber: currentEpisode.episode_number,
        animeThumbnail: anime.thumbnail_url,
        animeTitle: cleanAnimeTitle(anime.title), 
        progress: 0, 
        timestamp: new Date().getTime()
      });

      // Update recently watched anime
      updateRecentlyWatchedAnime({
        id: anime.id.toString(),
        title: cleanAnimeTitle(anime.title), 
        thumbnail_url: anime.thumbnail_url,
        genre: anime.genre,
        timestamp: new Date().getTime()
      });
    }
  }, [anime, currentEpisode, animeId, episodeId]);
  
  // Define a ref to track if we're on the first render
  const isFirstRender = useRef(true);
  const videoLoaded = useRef(false);
  
  // Force a window scroll to the top when changing episodes
  // This helps trigger any lazy-loaded components to reinitialize
  useEffect(() => {
    if (currentEpisode) {
      // Scroll to top
      window.scrollTo(0, 0);
      
      // On first load, don't show loading state
      if (isFirstRender.current) {
        isFirstRender.current = false;
        return;
      }
      
      // Set loading state
      setIsNavigating(true);
      videoLoaded.current = false;
      
      // Add a small delay before forcibly reloading any existing player elements
      const timer = setTimeout(() => {
        // Force a complete reload of the player by simulating component unmount/remount
        const videoContainer = document.querySelector('.enhanced-player-container');
        if (videoContainer) {
          // Hide it first to prevent black screen
          videoContainer.classList.add('opacity-0');
          
          const videoElements = document.querySelectorAll('video');
          videoElements.forEach(video => {
            if (video.src) {
              try {
                // Stop any current playback
                video.pause();
                
                // Explicitly clear and reset source to force complete reload
                const currentSrc = video.src;
                video.removeAttribute('src');
                video.load();
                
                // Wait before setting new source
                setTimeout(() => {
                  video.src = currentSrc;
                  video.load();
                  
                  // Wait for video to be ready
                  video.onloadeddata = () => {
                    videoLoaded.current = true;
                    videoContainer.classList.remove('opacity-0');
                    video.play().catch(e => console.error('Error playing after episode change:', e));
                    setTimeout(() => setIsNavigating(false), 300);
                  };
                  
                  // Fallback in case onloadeddata doesn't fire
                  setTimeout(() => {
                    if (!videoLoaded.current) {
                      videoContainer.classList.remove('opacity-0');
                      video.play().catch(e => console.error('Error playing after fallback:', e));
                      setIsNavigating(false);
                    }
                  }, 2000);
                }, 200);
              } catch (error) {
                console.error('Error during video element reset:', error);
                setIsNavigating(false);
              }
            }
          });
        } else {
          // If we can't find video container, just turn off loading state after delay
          setTimeout(() => setIsNavigating(false), 1000);
        }
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [currentEpisode?.id]);

  // Store current navigation state in ref to prevent race conditions
  const navigationInProgressRef = useRef(false);
  
  // Completely replace the navigation handling with a direct page reload approach
  const handleNextEpisode = useCallback(() => {
    if (currentEpisodeIndex < episodes.length - 1 && !navigationInProgressRef.current) {
      // Mark navigation as in progress to prevent double calls
      navigationInProgressRef.current = true;
      
      // Show loading overlay
      setIsNavigating(true);
      
      // Get next episode
      const nextEp = episodes[currentEpisodeIndex + 1];
      
      // Force a COMPLETE navigation - this essentially reloads the page entirely
      try {
        // Use replace instead of href to avoid issues with browser history
        window.location.replace(`/watch/${animeId}/${nextEp.id}?force=true&t=${Date.now()}`);
      } catch (e) {
        console.error('Critical navigation error:', e);
        // Last resort - reload the whole page and let it redirect
        window.location.reload();
      }
    }
  }, [currentEpisodeIndex, episodes, animeId]);

  const handlePreviousEpisode = useCallback(() => {
    if (currentEpisodeIndex > 0 && !navigationInProgressRef.current) {
      // Mark navigation as in progress to prevent double calls
      navigationInProgressRef.current = true;
      
      // Show loading overlay
      setIsNavigating(true);
      
      // Get previous episode
      const prevEp = episodes[currentEpisodeIndex - 1];
      
      // Force a COMPLETE navigation - this essentially reloads the page entirely
      try {
        // Use replace instead of href to avoid issues with browser history
        window.location.replace(`/watch/${animeId}/${prevEp.id}?force=true&t=${Date.now()}`);
      } catch (e) {
        console.error('Critical navigation error:', e);
        // Last resort - reload the whole page and let it redirect
        window.location.reload();
      }
    }
  }, [currentEpisodeIndex, episodes, animeId]);

  // Handle loading state
  if (isLoadingAnime || isLoadingEpisode) {
    return (
      <div className="h-screen flex flex-col bg-black p-4">
        <div className="max-w-7xl mx-auto w-full space-y-4">
          <Skeleton className="w-full aspect-video rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (!anime) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-center p-4">
          <h1 className="text-2xl font-bold mb-2">Anime not found</h1>
          <p className="mb-4">This anime doesn't exist or is unavailable.</p>
          <button 
            className="bg-primary hover:bg-primary/90 transition px-6 py-2 rounded-full"
            onClick={() => setLocation('/')}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // If no episode is specified, redirect to first episode
  if (!currentEpisode && episodes.length > 0) {
    setLocation(`/watch/${animeId}/${episodes[0].id}?t=${Date.now()}`);
    return null;
  }


  // If no episodes available
  if (!currentEpisode || episodes.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black">
        <div className="text-center p-4">
          <h1 className="heading-responsive mb-2">No episodes available</h1>
          <p className="text-responsive mb-4">This anime doesn't have any episodes yet.</p>
          <button 
            className="bg-primary hover:bg-primary/90 transition px-6 py-2 rounded-full text-responsive"
            onClick={() => setLocation(`/anime/${animeId}`)}
          >
            Back to Anime
          </button>
        </div>
      </div>
    );
  }

  // Format and clean data for SEO
  const cleanedAnimeTitle = anime ? cleanAnimeTitle(anime.title) : '';
  const episodeTitle = currentEpisode ? `${cleanedAnimeTitle} Episode ${currentEpisode.episode_number}` : '';
  const episodeDescription = currentEpisode && currentEpisode.description 
    ? currentEpisode.description 
    : `Watch ${cleanedAnimeTitle} Episode ${currentEpisode?.episode_number} online.`;
  
  // Format enhanced structured data for this episode with more detailed metadata
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": episodeTitle,
    "description": episodeDescription,
    "thumbnailUrl": currentEpisode?.thumbnail_url || anime?.thumbnail_url,
    "uploadDate": new Date().toISOString(),
    "contentUrl": `https://9anime.fun/watch/${animeId}/${episodeId}`,
    "embedUrl": `https://9anime.fun/watch/${animeId}/${episodeId}`,
    "duration": "PT24M", // Standard episode length, ideally dynamic from real duration
    "inLanguage": ["ja", "en"],
    "subtitleLanguage": ["en"],
    "keywords": `anime,${cleanedAnimeTitle},episode ${currentEpisode?.episode_number},streaming,watch online`,
    "accessMode": ["visual", "auditory"],
    "isAccessibleForFree": true,
    "creditText": `Anime: ${cleanedAnimeTitle}`,
    "partOfSeries": {
      "@type": "TVSeries",
      "name": cleanedAnimeTitle,
      "url": `https://9anime.fun/anime/${animeId}`
    },
    "episodeNumber": currentEpisode?.episode_number,
    "potentialAction": {
      "@type": "WatchAction",
      "target": `https://9anime.fun/watch/${animeId}/${episodeId}`
    },
    // Add video quality options for better SEO
    "videoQuality": ["HD", "SD"],
    "contentRating": "TV-14"
  };

  // Additional structured data for the breadcrumb navigation
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://9anime.fun/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": cleanedAnimeTitle,
        "item": `https://9anime.fun/anime/${animeId}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `Episode ${currentEpisode?.episode_number}`,
        "item": `https://9anime.fun/watch/${animeId}/${episodeId}`
      }
    ]
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-black to-dark-950">
      <Helmet>
        <title>{episodeTitle} | Watch on 9Anime.fun</title>
        <meta name="description" content={episodeDescription.substring(0, 160)} />
        <meta name="keywords" content={`${cleanedAnimeTitle}, episode ${currentEpisode?.episode_number}, watch ${cleanedAnimeTitle}, anime streaming, free anime, 9anime`} />
        <link rel="canonical" href={`https://9anime.fun/watch/${animeId}/${episodeId}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="video.episode" />
        <meta property="og:title" content={`${episodeTitle} | Watch on 9Anime.fun`} />
        <meta property="og:description" content={episodeDescription.substring(0, 200)} />
        <meta property="og:image" content={currentEpisode?.thumbnail_url || anime?.thumbnail_url} />
        <meta property="og:url" content={`https://9anime.fun/watch/${animeId}/${episodeId}`} />
        <meta property="og:video" content={currentEpisode?.video_url_max_quality} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="player" />
        <meta name="twitter:title" content={`${episodeTitle} | Watch on 9Anime.fun`} />
        <meta name="twitter:description" content={episodeDescription.substring(0, 200)} />
        <meta name="twitter:image" content={currentEpisode?.thumbnail_url || anime?.thumbnail_url} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Breadcrumb Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>
      
      <div className="max-w-7xl mx-auto w-full relative z-10">
        {/* Test Player Implementation */}
        <div className="w-full flex flex-col bg-black">
          <div className="relative w-full bg-black overflow-hidden aspect-video">
            {/* Show loading overlay when navigating between episodes */}
            {isNavigating && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                <div className="text-center">
                  <div className="inline-block w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
                  <p className="mt-4 text-white text-opacity-90 text-lg font-semibold">Loading episode...</p>
                </div>
              </div>
            )}
            
            <TestFluidPlayer 
              key={`episode-player-${currentEpisode.id}`} 
              episode={currentEpisode}
              onClose={() => {
                // Simply go back to anime details page as fallback
                setLocation(`/anime/${animeId}`);
              }}
            />
          </div>

          {/* Episode navigation bar */}
          <div className="bg-black py-2 px-3 sm:py-3 sm:px-4 flex justify-between items-center border-t border-gray-800/30">
            <button
              className="bg-gray-800/70 hover:bg-gray-700/70 transition px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={handlePreviousEpisode}
              disabled={!(currentEpisodeIndex > 0) || isNavigating}
            >
              {isNavigating ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 mr-1 border-t-2 border-white border-solid rounded-full animate-spin"></div>
              ) : (
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="19 20 9 12 19 4"></polyline>
                </svg>
              )}
              <span className="sm:inline hidden">Previous</span>
              <span className="sm:hidden inline">Prev</span>
            </button>

            <div className="text-xs sm:text-sm text-gray-300">
              Ep <span className="font-bold">{currentEpisode.episode_number}</span>
            </div>

            <button
              className="bg-gray-800/70 hover:bg-gray-700/70 transition px-2 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              onClick={handleNextEpisode}
              disabled={!(currentEpisodeIndex < episodes.length - 1) || isNavigating}
            >
              <span className="sm:inline hidden">Next</span>
              <span className="sm:hidden inline">Next</span>
              {isNavigating ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 ml-1 border-t-2 border-white border-solid rounded-full animate-spin"></div>
              ) : (
                <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="5 4 15 12 5 20"></polyline>
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4 md:space-y-6 rounded-t-xl backdrop-blur-sm bg-black/40 border-t border-white/5">
          {/* Episode Info */}
          <div className="glass-effect p-4 rounded-lg border border-white/10 transition-all duration-300 hover:scale-[1.02] hover:border-white/20">
            <h2 className="text-2xl font-bold mb-2">{cleanAnimeTitle(anime.title)}</h2>
            <p className="text-gray-400">Episode {currentEpisode.episode_number}: {currentEpisode.title}</p>
          </div>

          {/* Episode Description */}
          <div>
            <p className="text-gray-300">{currentEpisode.description || "No description available."}</p>
          </div>

          {/* Episodes List */}
          <div>
            <h3 className="subheading-responsive mb-3">Episodes</h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {episodes.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => {
                    if (!isNavigating && !navigationInProgressRef.current) {
                      // Mark navigation as in progress
                      navigationInProgressRef.current = true;
                      setIsNavigating(true);
                      
                      // Force a COMPLETE navigation - this essentially reloads the page entirely
                      try {
                        // Use replace instead of href to avoid issues with browser history
                        window.location.replace(`/watch/${animeId}/${ep.id}?force=true&t=${Date.now()}`);
                      } catch (e) {
                        console.error('Critical navigation error:', e);
                        // Last resort - reload the whole page and let it redirect
                        window.location.reload();
                      }
                    }
                  }}
                  disabled={isNavigating}
                  className={cn(
                    "p-4 rounded-lg text-left transition-all duration-300 flex flex-col glass-card",
                    "hover:scale-[1.05] hover:shadow-lg hover:shadow-primary/20",
                    ep.id === currentEpisode.id 
                      ? "bg-primary/20 text-white shadow-lg shadow-primary/30 border-primary/30" 
                      : "text-gray-300 glass-effect",
                    isNavigating && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="font-medium text-mobile-optimized">Episode {ep.episode_number}</div>
                  <div className="caption-responsive truncate mt-1 line-clamp-1">{ep.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;