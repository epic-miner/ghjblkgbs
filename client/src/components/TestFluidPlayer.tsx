import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Episode } from '../../../shared/types';
import CustomQualityMenu from './CustomQualityMenu';
import { updateWatchHistory } from '../lib/cookies';
import '../styles/fluid-player.css';
import '../styles/play-button-fix.css';

// Define the quality types
export type VideoQuality = '1080p' | '720p' | '480p' | 'auto';

interface TestFluidPlayerProps {
  episode: Episode | null;
  onClose: () => void;
}

// Add a type for Fluid Player global variable
interface FluidPlayerWindow extends Window {
  fluidPlayer: (element: string | HTMLVideoElement, options?: any) => any;
}
declare const window: FluidPlayerWindow;

const TestFluidPlayer: React.FC<TestFluidPlayerProps> = ({ episode, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('auto');
  const [isLoaded, setIsLoaded] = useState(false);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Fluid Player when the component mounts
  useEffect(() => {
    if (!videoRef.current || !episode) return;

    // Set the initial source to max quality
    const initialSource = episode.video_url_max_quality;
    videoRef.current.src = initialSource;

    // Initialize Fluid Player
    const initFluidPlayer = () => {
      if (!videoRef.current || !episode) return;
      
      if (typeof window.fluidPlayer !== 'function') {
        console.log('Fluid Player not available yet, trying again in 500ms');
        setTimeout(initFluidPlayer, 500);
        return;
      }
      
      try {
        // Clean up previous instance if it exists
        if (playerInstanceRef.current) {
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        }
        
        // Configure enhanced Fluid Player with purple theme
        const playerOptions = {
          layoutControls: {
            primaryColor: "hsl(266, 100%, 64%)", // Purple theme
            fillToContainer: true,
            posterImage: episode.thumbnail_url,
            posterImageSize: 'cover',
            playButtonShowing: true,
            playPauseAnimation: true,
            autoPlay: true,
            mute: false,
            keyboardControl: true,
            doubleclickFullscreen: true,
            loop: false,
            allowDownload: false,
            playbackRateEnabled: true,
            allowTheatre: true,
            miniPlayer: {
              enabled: true,
              width: 400,
              widthMobile: 280,
              placeholderText: "Playing in Mini Player",
              position: "bottom right"
            },
            controlBar: {
              autoHide: true,
              autoHideTimeout: 3,
              animated: true
            },
            logo: {
              position: 'top left',
              clickUrl: null,
              opacity: 0.8,
              hideWithControls: true,
              showOverAds: false
            },
            contextMenu: {
              controls: true,
              links: []
            },
            controlForwardBackward: {
              show: true,
              doubleTapMobile: true
            }
          },
          modules: {
            configureHls: (options: any) => {
              return {
                ...options,
                enableWorker: true,
                lowLatencyMode: true,
                startLevel: -1
              };
            }
          }
        };
        
        // Initialize player with the video element id
        playerInstanceRef.current = window.fluidPlayer(videoRef.current, playerOptions);
        
        console.log('Fluid Player initialized successfully');
        
        // Register event handlers
        if (playerInstanceRef.current) {
          playerInstanceRef.current.on('play', () => {
            setIsPlaying(true);
            console.log('Video played');
            startWatchHistoryTracking();
          });
          
          playerInstanceRef.current.on('pause', () => {
            setIsPlaying(false);
            console.log('Video paused');
          });
          
          playerInstanceRef.current.on('timeupdate', (time: number) => {
            setCurrentTime(time);
          });
          
          playerInstanceRef.current.on('ended', () => {
            clearWatchHistoryTracking();
            console.log('Video ended');
          });
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error initializing Fluid Player:', error);
        
        // Fall back to native video controls if Fluid Player fails
        if (videoRef.current) {
          videoRef.current.controls = true;
        }
      }
    };
    
    // Start initialization
    initFluidPlayer();
    
    // Cleanup on unmount
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      
      if (playerInstanceRef.current) {
        try {
          playerInstanceRef.current.destroy();
          playerInstanceRef.current = null;
        } catch (error) {
          console.error('Error destroying player:', error);
        }
      }
    };
  }, [episode]);

  // Handle quality change
  const handleQualityChange = (quality: VideoQuality) => {
    setSelectedQuality(quality);

    console.log(`TestFluidPlayer: Quality changed to ${quality}`);

    // Get the specific URL for the selected quality without fallbacks
    let videoUrl = '';

    if (episode) {
      switch(quality) {
        case '1080p':
          videoUrl = episode.video_url_1080p || '';
          break;
        case '720p':
          videoUrl = episode.video_url_720p || '';
          break;
        case '480p':
          videoUrl = episode.video_url_480p || '';
          break;
        case 'auto':
          videoUrl = episode.video_url_max_quality || '';
          break;
      }

      console.log(`URL for ${quality}: ${videoUrl}`);

      // Only use fallbacks if the specific quality URL is not available
      if (!videoUrl) {
        console.log(`${quality} not available, falling back to max quality`);
        videoUrl = episode.video_url_max_quality || '';
      }
    }

    if (videoRef.current && videoUrl) {
      // Store current playback position and state
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;

      // Update video source
      videoRef.current.src = videoUrl;
      videoRef.current.load();

      // Restore playback position and state after source change
      videoRef.current.onloadeddata = () => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;

          if (wasPlaying) {
            videoRef.current.play().catch(error => {
              console.error("Error playing video after quality change:", error);
            });
          }
        }
      };
    } else {
      console.warn(`No video URL available for quality: ${quality}`);
    }
  };

  // Watch history tracking functions
  const startWatchHistoryTracking = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    // Update watch history every 5 seconds
    updateIntervalRef.current = setInterval(() => {
      updateWatchProgress();
    }, 5000);
  };

  const clearWatchHistoryTracking = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
  };

  const updateWatchProgress = () => {
    if (!videoRef.current || !episode?.id) return;

    const currentVideoTime = videoRef.current.currentTime;
    const videoDuration = videoRef.current.duration;

    if (isNaN(videoDuration) || videoDuration <= 0) return;

    // Calculate percentage progress
    const progressPercentage = Math.floor((currentVideoTime / videoDuration) * 100);

    // Update watch history
    updateWatchHistory({
      animeId: episode.anime_id.toString(),
      episodeId: episode.id.toString(),
      title: episode.title || '',
      episodeNumber: episode.episode_number,
      animeThumbnail: episode.thumbnail_url,
      animeTitle: episode.anime_title || '',
      progress: progressPercentage,
      timestamp: new Date().getTime()
    });
  };

  // Apply play button fixes
  useEffect(() => {
    // Function to inject style to fix play button color
    const injectPlayButtonFix = () => {
      // Create a style element if it doesn't exist
      let styleEl = document.getElementById('play-button-style-fix');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'play-button-style-fix';
        document.head.appendChild(styleEl);
      }

      // Add more specific CSS to override dynamically generated styles
      styleEl.innerHTML = `
        /* Force override for play button triangle */
        .fluid_initial_play_button {
          border-color: transparent transparent transparent hsl(266, 100%, 64%) !important;
        }
        
        /* Target dynamically added pseudo-elements */
        .fluid_initial_play_button:before,
        .fluid_initial_play_button:after {
          border-color: transparent transparent transparent hsl(266, 100%, 64%) !important;
        }
        
        /* For SVG triangles or other icons */
        .fluid_initial_play_button svg,
        .fluid_initial_play_button i {
          color: hsl(266, 100%, 64%) !important;
          fill: hsl(266, 100%, 64%) !important;
        }
      `;
    };

    // Run the injection when component mounts
    injectPlayButtonFix();
    
    return () => {
      const styleEl = document.getElementById('play-button-style-fix');
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, []);

  // Render the player component
  return (
    <div className="fluid-player-wrapper w-full relative">
      {/* Video element */}
      <video 
        ref={videoRef}
        id="test-fluid-video-player"
        className="w-full h-auto"
        controls
        autoPlay
        playsInline
      >
        {episode?.video_url_1080p && (
          <source src={episode.video_url_1080p} type="video/mp4" data-fluid-hd title="1080p" />
        )}
        {episode?.video_url_720p && (
          <source src={episode.video_url_720p} type="video/mp4" data-fluid-hd title="720p" />
        )}
        {episode?.video_url_480p && (
          <source src={episode.video_url_480p} type="video/mp4" title="480p" />
        )}
        <source src={episode?.video_url_max_quality || ''} type="video/mp4" title="Max Quality" />
        Your browser does not support the video tag.
      </video>

      {/* Quality menu - shown when fluid player is not available as fallback */}
      {isLoaded && episode && !playerInstanceRef.current && (
        <CustomQualityMenu
          player={null}
          videoElement={videoRef.current}
          episode={episode}
          onQualityChange={handleQualityChange}
          selectedQuality={selectedQuality}
        />
      )}
    </div>
  );
};

export default TestFluidPlayer;