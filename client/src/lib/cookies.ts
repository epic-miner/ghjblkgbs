import Cookies from 'js-cookie';
import { WatchHistoryItem, RecentlyWatchedAnime } from '@shared/types';
import { cleanAnimeTitle } from '../utils/titleFormatter';

const WATCH_HISTORY_COOKIE = 'animeflix_watch_history';
const RECENTLY_WATCHED_COOKIE = 'animeflix_recently_watched';
const COOKIE_EXPIRATION = 30; // days

// Watch history functions
export const getWatchHistory = (): WatchHistoryItem[] => {
  try {
    const historyData = Cookies.get(WATCH_HISTORY_COOKIE);
    return historyData ? JSON.parse(historyData) : [];
  } catch (error) {
    console.error('Error getting watch history:', error);
    return [];
  }
};

export const updateWatchHistory = (item: WatchHistoryItem): void => {
  try {
    const history = getWatchHistory();
    
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
    
    Cookies.set(WATCH_HISTORY_COOKIE, JSON.stringify(updatedHistory), { 
      expires: COOKIE_EXPIRATION,
      sameSite: 'Lax'
    });
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

// Recently watched anime functions
export const getRecentlyWatchedAnime = (): RecentlyWatchedAnime[] => {
  try {
    const recentData = Cookies.get(RECENTLY_WATCHED_COOKIE);
    return recentData ? JSON.parse(recentData) : [];
  } catch (error) {
    console.error('Error getting recently watched anime:', error);
    return [];
  }
};

export const updateRecentlyWatchedAnime = (anime: RecentlyWatchedAnime): void => {
  try {
    const recentlyWatched = getRecentlyWatchedAnime();
    
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
    
    Cookies.set(RECENTLY_WATCHED_COOKIE, JSON.stringify(updatedRecent), { 
      expires: COOKIE_EXPIRATION,
      sameSite: 'Lax'
    });
  } catch (error) {
    console.error('Error updating recently watched anime:', error);
  }
};
