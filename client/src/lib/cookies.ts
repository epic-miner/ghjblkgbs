import Cookies from 'js-cookie';
import { WatchHistoryItem, RecentlyWatchedAnime } from '@shared/types';
import { cleanAnimeTitle } from '../utils/titleFormatter';
import { debounce } from './utils';

const WATCH_HISTORY_COOKIE = 'animeflix_watch_history';
const RECENTLY_WATCHED_COOKIE = 'animeflix_recently_watched';
const COOKIE_EXPIRATION = 30; // days

// Memory cache to reduce cookie reads
let watchHistoryCache: WatchHistoryItem[] = [];
let lastWatchHistoryUpdate = 0;
const CACHE_TTL = 30000; // 30 seconds cache validity

// Watch history functions with memory caching for better performance
export const getWatchHistory = (): WatchHistoryItem[] => {
  try {
    const now = Date.now();
    
    // Use cache if available and recent
    if (watchHistoryCache.length > 0 && (now - lastWatchHistoryUpdate < CACHE_TTL)) {
      return watchHistoryCache;
    }
    
    // Read from cookie if cache is outdated or unavailable
    const historyData = Cookies.get(WATCH_HISTORY_COOKIE);
    watchHistoryCache = historyData ? JSON.parse(historyData) : [];
    lastWatchHistoryUpdate = now;
    
    return watchHistoryCache;
  } catch (error) {
    console.error('Error getting watch history:', error);
    return [];
  }
};

// Debounced cookie write function to reduce storage operations
// This creates a single function shared by all calls to updateWatchHistory
const debouncedCookieWrite = debounce((data: WatchHistoryItem[]) => {
  Cookies.set(WATCH_HISTORY_COOKIE, JSON.stringify(data), { 
    expires: COOKIE_EXPIRATION,
    sameSite: 'Lax'
  });
  console.log('Cookie write completed');
}, 2000); // 2 seconds debounce to batch multiple updates

export const updateWatchHistory = (item: WatchHistoryItem): void => {
  try {
    const history = getWatchHistory();
    
    // Check if we already have an entry with the same progress
    const existingItem = history.find(
      historyItem => historyItem.animeId === item.animeId && 
                    historyItem.episodeId === item.episodeId
    );
    
    // Skip updates if progress difference is insignificant (less than 2%)
    if (existingItem && Math.abs(existingItem.progress - item.progress) < 2) {
      return;
    }
    
    // Remove any existing entry for this episode
    const filteredHistory = history.filter(
      historyItem => !(historyItem.animeId === item.animeId && historyItem.episodeId === item.episodeId)
    );
    
    // Clean the title before saving
    const cleanedItem = {
      ...item,
      title: cleanAnimeTitle(item.title),
      animeTitle: cleanAnimeTitle(item.animeTitle)
    };
    
    // Add new entry at the beginning
    const updatedHistory = [cleanedItem, ...filteredHistory].slice(0, 20); // Keep only last 20 items
    
    // Update cache immediately
    watchHistoryCache = updatedHistory;
    lastWatchHistoryUpdate = Date.now();
    
    // Debounce cookie writes to reduce storage operations
    debouncedCookieWrite(updatedHistory);
  } catch (error) {
    console.error('Error updating watch history:', error);
  }
};

export const getWatchProgressForEpisode = (animeId: string, episodeId: string): number => {
  const history = getWatchHistory();
  const found = history.find(
    item => item.animeId === animeId && item.episodeId === episodeId
  );
  return found ? found.progress : 0;
};

// Recently watched anime functions with caching for better performance
// Memory cache for recently watched
let recentlyWatchedCache: RecentlyWatchedAnime[] = [];
let lastRecentlyWatchedUpdate = 0;

export const getRecentlyWatchedAnime = (): RecentlyWatchedAnime[] => {
  try {
    const now = Date.now();
    
    // Use cache if available and recent
    if (recentlyWatchedCache.length > 0 && (now - lastRecentlyWatchedUpdate < CACHE_TTL)) {
      return recentlyWatchedCache;
    }
    
    // Read from cookie if cache is outdated or unavailable
    const recentData = Cookies.get(RECENTLY_WATCHED_COOKIE);
    recentlyWatchedCache = recentData ? JSON.parse(recentData) : [];
    lastRecentlyWatchedUpdate = now;
    
    return recentlyWatchedCache;
  } catch (error) {
    console.error('Error getting recently watched anime:', error);
    return [];
  }
};

// Debounced cookie write function for recently watched
const debouncedRecentlyWatchedWrite = debounce((data: RecentlyWatchedAnime[]) => {
  Cookies.set(RECENTLY_WATCHED_COOKIE, JSON.stringify(data), { 
    expires: COOKIE_EXPIRATION,
    sameSite: 'Lax'
  });
  console.log('Recently watched cookie write completed');
}, 2000); // 2 seconds debounce

export const updateRecentlyWatchedAnime = (anime: RecentlyWatchedAnime): void => {
  try {
    const recentlyWatched = getRecentlyWatchedAnime();
    
    // Skip if we already have this anime with a recent timestamp (within 5 minutes)
    const existingItem = recentlyWatched.find(item => item.id === anime.id);
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    if (existingItem && existingItem.timestamp > fiveMinutesAgo) {
      // Existing entry is recent, skip update to reduce cookie operations
      return;
    }
    
    // Remove any existing entry for this anime
    const filteredRecent = recentlyWatched.filter(
      item => item.id !== anime.id
    );
    
    // Clean the title before saving
    const cleanedAnime = {
      ...anime,
      title: cleanAnimeTitle(anime.title)
    };
    
    // Add new entry at the beginning
    const updatedRecent = [cleanedAnime, ...filteredRecent].slice(0, 10); // Keep only last 10 items
    
    // Update cache immediately
    recentlyWatchedCache = updatedRecent;
    lastRecentlyWatchedUpdate = Date.now();
    
    // Debounce cookie writes for better performance
    debouncedRecentlyWatchedWrite(updatedRecent);
  } catch (error) {
    console.error('Error updating recently watched anime:', error);
  }
};
