import { Link } from 'wouter';
import { Anime } from '@shared/types';
import { PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { memo, useMemo } from 'react';
import { cleanAnimeTitle } from '../utils/titleFormatter';

interface AnimeCardProps {
  anime: Anime;
  className?: string;
  episodeCount?: number;
  rating?: number;
  progress?: number;
  showProgress?: boolean;
  onQuickPlay?: () => void;
}

// Using React.memo to prevent unnecessary re-renders when props haven't changed
const AnimeCard = memo(({ 
  anime, 
  className,
  episodeCount,
  rating,
  progress,
  showProgress = false,
  onQuickPlay 
}: AnimeCardProps) => {
  // Memoize expensive computations
  const isContinueWatching = useMemo(() => 
    className?.includes('continue-watching-card'), [className]);
  
  const sanitizedTitle = useMemo(() => 
    cleanAnimeTitle(anime.title), [anime.title]);
    
  const primaryGenre = useMemo(() => 
    anime.genre.split(',')[0], [anime.genre]);
  
  // Memoize class names to avoid recomputing on every render
  const containerClasses = useMemo(() => cn(
    "relative group cursor-pointer glass-effect transition-all duration-300 rounded-2xl",
    "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 hover:ring-2 hover:ring-primary/30",
    isContinueWatching && "border-primary/30"
  ), [isContinueWatching]);

  const imageContainerClasses = useMemo(() => cn(
    "rounded-2xl overflow-hidden relative",
    isContinueWatching ? "aspect-[3/4]" : "aspect-[2/3]"
  ), [isContinueWatching]);

  const overlayClasses = useMemo(() => cn(
    "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
    "opacity-0 group-hover:opacity-100 transition-all duration-300",
    isContinueWatching && "from-primary/40"
  ), [isContinueWatching]);

  const buttonClasses = useMemo(() => cn(
    "bg-primary/90 hover:bg-primary text-white p-3 rounded-full",
    "transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-125",
    "shadow-lg backdrop-blur-sm",
    isContinueWatching && "shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
  ), [isContinueWatching]);

  const progressBarClasses = useMemo(() => cn(
    "h-full transition-all duration-700 ease-out",
    isContinueWatching 
      ? "bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
      : "bg-primary"
  ), [isContinueWatching]);

  const titleContainerClasses = useMemo(() => cn(
    "transform transition-all duration-300 group-hover:translate-x-1",
    isContinueWatching 
      ? "h-[2rem] p-1 md:p-1.5" 
      : "h-[2.5rem] md:h-[4.5rem] p-1.5 md:p-2"
  ), [isContinueWatching]);

  const titleClasses = useMemo(() => cn(
    "font-medium line-clamp-1 text-white/90 group-hover:text-white",
    isContinueWatching 
      ? "text-[10px] md:text-xs" 
      : "text-xs md:text-sm md:line-clamp-2"
  ), [isContinueWatching]);

  // Optimized click handler
  const handleQuickPlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onQuickPlay?.();
  };

  // Optimized error handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/images/placeholder.jpg';
  };

  return (
    <Link href={`/anime/${anime.id}`} className={cn("block", className)}>
      <div className={containerClasses}>
        {/* Main Image Container with aspect ratio */}
        <div className={imageContainerClasses}>
          <img 
            src={anime.thumbnail_url} 
            alt={sanitizedTitle}
            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={handleImageError}
            width="300" // Adding width/height to improve CLS
            height="450"
          />

          {/* Overlay on hover */}
          <div className={overlayClasses}>
            {onQuickPlay && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={handleQuickPlayClick}
                  className={buttonClasses}
                  aria-label="Play"
                >
                  <PlayCircle className="w-6 h-6 md:w-7 md:h-7 drop-shadow-lg animate-pulse" />
                </button>
              </div>
            )}
          </div>

          {/* Episode count badge */}
          {episodeCount !== undefined && (
            <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full shadow-md flex items-center">
              <i className="fas fa-film mr-1 text-primary"></i>
              {episodeCount} {episodeCount === 1 ? 'EP' : 'EPS'}
            </div>
          )}

          {/* Rating badge */}
          {rating && (
            <div className="absolute top-2 left-2 bg-primary/80 backdrop-blur-sm text-white text-[10px] md:text-xs px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full shadow-md flex items-center">
              <i className="fas fa-star mr-1 text-yellow-400 animate-pulse"></i>
              {rating.toFixed(1)}
            </div>
          )}

          {/* Progress bar with enhanced visual effects for continue watching */}
          {showProgress && progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800/80 backdrop-blur-sm">
              <div 
                className={progressBarClasses}
                style={{ width: `${progress}%` }}
              >
                {isContinueWatching && (
                  <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-45 animate-shimmer"></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Title and Genre - Compact for mobile and continue watching */}
        <div className={titleContainerClasses}>
          <h3 className={titleClasses}>
            {sanitizedTitle}
          </h3>
          {!isContinueWatching && (
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1 truncate group-hover:text-gray-300">
              {primaryGenre}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
});

AnimeCard.displayName = 'AnimeCard';

export default AnimeCard;