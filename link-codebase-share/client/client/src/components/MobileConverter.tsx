import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect, lazy } from 'react';
import { ParticleField } from './ui/ParticleField';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
import { 
  Home, 
  Link as LinkIcon, 
  History, 
  User, 
  Music, 
  Youtube, 
  Upload, 
  Download,
  Settings,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Loader2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Zap,
  Info,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Lock,
  Headphones,
  X,
  Volume2,
  VolumeX,
  Clock,
  Users,
  Heart,
  Star,
  TrendingUp,
  Calendar,
  MapPin,
  Globe,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Sparkles,
  Palette,
  Filter,
  Share2,
  Plus,
  Minus,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Phone,
  Unlock,
  Key,
  ShieldCheck,
  HelpCircle,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Trash2,
  Bell,
  Sun,
  Moon,
  AlertCircle,
  Crown,
  Camera,
  Edit,
  Edit3,
  ExternalLink,
  ListMusic
} from 'lucide-react';
import { FaSpotify } from 'react-icons/fa';
import { ResponsiveLayout, MobileHeader, MobileContent, MobileBottomNav, MobileNavItem, MobileCard, MobileButton } from './ResponsiveLayout';
import { useAuth } from '../lib/AuthContext';
import { useConversion, type FailedTrack } from '../lib/ConversionContext';
import { ConversionStatus } from '../types/conversion';
import { getYouTubeAuthUrl, getYouTubeToken } from '../lib/youtubeAuth';
import { initSpotifyAuth } from '../lib/spotifyAuth';
import { cn } from '../lib/utils';
import { GlassmorphicCard } from './ui/GlassmorphicCard';
import { GlowButton } from './ui/GlowButton';
import { GlassmorphicContainer } from './ui/GlassmorphicContainer';
import { FloatingLabels } from './ui/FloatingLabels';
import AnimatedGradientText from './ui/AnimatedGradientText';
import LightingText from './ui/LightingText';
import SpotlightCard from './ui/SpotlightCard';
import { MobileFailedTracksDetails } from './visualization/MobileFailedTracksDetails';
import SoundSwappLogo from '../assets/SoundSwappLogo';
import { ToastContainer, Toast } from './feedback/EnhancedToast';
import { AIConversionOptimizer } from './AIConversionOptimizer';
import { AIDiscoveryIntegration } from './AIDiscoveryIntegration';
import { openUrlOnMobile, openUrlOnMobileAlternative } from '../utils/mobileUtils';
// Success celebration is lazy-loaded below
import EnhancedConnectionCard from './EnhancedConnectionCard';
import { PlaylistInsights } from './visualization/PlaylistInsights';
import { useHapticFeedback } from '../hooks/useHapticFeedback';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { useSwipeGestures } from '../hooks/useSwipeGestures';
import { useLongPress } from '../hooks/useLongPress';
import { useSwipeActions } from '../hooks/useSwipeActions';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { useTheme } from '../lib/ThemeContext';
import { usePerformanceOptimization } from '../hooks/usePerformanceOptimization';
import { currentPerformanceConfig } from '../config/performance';
import { useScrollProgress, useScrollDirection } from '../hooks/useScrollAnimation';
import { useViewportLogger } from '../hooks/useViewportAnalysis';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import { ProfileTab } from './tabs/ProfileTab';
import { AIDiscoveryPage } from '../pages/AIDiscoveryPage';


// Performance constants
const DEBOUNCE_DELAY = 300;
const LAZY_LOAD_DELAY = 100;
const ANIMATION_DURATION = 0.3;
const SPRING_CONFIG = { type: "spring" as const, stiffness: 300, damping: 30 };

// Lazy load heavy components
const LazySuccessCelebration = lazy(() => import('./feedback/SuccessCelebration').then(module => ({ default: module.SuccessCelebration })));

// Memoized components for better performance
const MemoizedSoundSwappLogo = React.memo(SoundSwappLogo);
const MemoizedParticleField = React.memo(({ isDark, className }: { isDark: boolean; className: string }) => (
  <ParticleField 
    color={isDark ? "var(--particle-color, #FF7A59)" : "var(--particle-color, #FF007A)"}
    density="low"
    className={className}
  />
));

// Optimized animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: ANIMATION_DURATION, ease: "easeOut" }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: ANIMATION_DURATION, ease: "easeOut" }
};

const slideIn = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: ANIMATION_DURATION, ease: "easeOut" }
};

// Optimized status indicators
const StatusIndicator = React.memo(({ 
  isVisible, 
  type, 
  message, 
  icon: Icon 
}: { 
  isVisible: boolean; 
  type: 'offline' | 'refreshing'; 
  message: string; 
  icon: React.ComponentType<any>; 
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 text-white text-center py-3 px-4 shadow-lg ${
          type === 'offline' ? 'bg-red-500' : 'bg-blue-500'
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
));

// Optimized theme toggle button
const ThemeToggleButton = React.memo(({ 
  isDark, 
  toggleTheme, 
  hapticLight 
}: { 
  isDark: boolean; 
  toggleTheme: () => void; 
  hapticLight: () => void; 
}) => (
  <motion.button 
    onClick={() => {
      toggleTheme();
      hapticLight();
    }}
    className={cn(
      "relative transition-all duration-300",
      isDark 
        ? "text-yellow-500 hover:text-yellow-400" 
        : "text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-100"
    )}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    transition={SPRING_CONFIG}
  >
    <motion.div
      animate={{ rotate: isDark ? 180 : 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {isDark ? (
        <Sun className="w-6 h-6 drop-shadow-sm" />
      ) : (
        <Moon className="w-6 h-6 drop-shadow-sm" />
      )}
    </motion.div>
  </motion.button>
));

// Platform key type
export type PlatformKey = 'spotify' | 'youtube' | 'soundcloud';

// Define YouTube playlist interface
interface YouTubePlaylist {
  id: string;
  snippet?: {
    title?: string;
    thumbnails?: {
      default?: {
        url: string;
      };
    };
    channelTitle?: string;
  };
  contentDetails?: {
    itemCount?: number;
  };
}

// Enhanced track interface
interface Track {
  id: string;
  name: string;
  artists: string[];
  artistIds?: string[];
  artistImages?: string[];
  genres?: string[];
  album?: string;
  duration_ms: number;
  popularity: number;
  explicit?: boolean;
  releaseYear?: string;
  searchQuery?: string;
  videoId?: string;
}

// Keyboard accessibility helper
interface KeyboardFocusableCardProps {
  children: React.ReactNode;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  className?: string;
  [key: string]: any;
}

const KeyboardFocusableCard: React.FC<KeyboardFocusableCardProps> = ({ 
  children, 
  onKeyDown, 
  onClick, 
  className, 
  ...props 
}) => {
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onKeyDown?.(e);
      
      if (!e.defaultPrevented && onClick) {
        onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  }, [onKeyDown, onClick]);
  
  return (
    <div 
      tabIndex={0} 
      role="button"
      className={cn(
        "focus:outline-none focus:ring-2 focus:ring-brand-primary-action focus:ring-offset-2 focus:ring-offset-background-primary rounded-lg transition-all",
        className
      )}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Create a reusable connection button component
interface ConnectButtonProps {
  platform: PlatformKey;
  isConnected: boolean;
  onConnect: () => void;
  className?: string;
}

// Platform connection button component
const ConnectButton: React.FC<ConnectButtonProps> = ({ platform, isConnected, onConnect, className }) => {
  const platformData = {
    spotify: {
      icon: (
        <img 
          src="/images/Spotify_Primary_Logo_RGB_Green.png" 
          alt="Spotify" 
          style={{ 
            height: 24, 
            width: 'auto', 
            objectFit: 'contain', 
            display: 'block',
            minWidth: '24px'
          }} 
          className="h-6 w-auto" 
        />
      ),
      text: 'Spotify',
      bgColor: 'bg-platform-spotify hover:bg-platform-spotify-hover',
      bgColorConnected: 'bg-platform-spotify-connected text-content-on-platform-spotify-connected'
    },
    youtube: {
      icon: (
        <img 
          src="/images/yt_logo_rgb_dark.png" 
          alt="YouTube" 
          style={{ 
            height: 24, 
            width: 'auto', 
            objectFit: 'contain', 
            display: 'block',
            minWidth: '24px'
          }} 
          className="h-6 w-auto" 
        />
      ),
      text: 'YouTube',
      bgColor: 'bg-platform-youtube hover:bg-platform-youtube-hover',
      bgColorConnected: 'bg-platform-youtube-connected text-content-on-platform-youtube-connected'
    },
    soundcloud: {
      icon: <Music className="h-5 w-5" />,
      text: 'SoundCloud',
      bgColor: 'bg-platform-soundcloud hover:bg-platform-soundcloud-hover', 
      bgColorConnected: 'bg-platform-soundcloud-connected text-content-on-platform-soundcloud-connected'
    }
  };
  
  const data = platformData[platform];
  
  return (
    <button
      onClick={onConnect}
      disabled={isConnected}
      className={cn(
        "flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium transition-colors",
        isConnected 
          ? data.bgColorConnected
          : `${data.bgColor} text-content-inverse`,
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-primary", 
        platform === 'spotify' ? 'focus:ring-platform-spotify' :
        platform === 'youtube' ? 'focus:ring-platform-youtube' :
        platform === 'soundcloud' ? 'focus:ring-platform-soundcloud' :
        'focus:ring-brand-primary-action',
        className
      )}
      aria-label={`${isConnected ? 'Connected to' : 'Connect to'} ${data.text}`}
    >
      {data.icon}
      <span>{isConnected ? 'Connected' : `Connect ${data.text}`}</span>
      {isConnected && <CheckCircle className="h-5 w-5 text-current" />}
    </button>
  );
};

// Define insights interfaces
import { PlaylistTypes } from '../types/playlist';
import { profileService } from '../services/profileService';

// Use shared types
type PlaylistStats = PlaylistTypes.PlaylistStats;
type Album = PlaylistTypes.Album;
type Genre = PlaylistTypes.Genre;
type Artist = PlaylistTypes.Artist;

interface ConversionTrack {
  name: string;
  artists: string[];
  popularity?: number;
  duration_ms?: number;
  explicit?: boolean;
  album?: string;
  releaseYear?: string | number;
  genres?: string[];
  artistImages?: string[];
}

// Convert track to the correct type
const convertTrack = (track: ConversionTrack): PlaylistTypes.Track => ({
  name: track.name,
  artists: track.artists,
  popularity: track.popularity,
  duration_ms: track.duration_ms,
  explicit: track.explicit,
  album: track.album,
  releaseYear: track.releaseYear ? Number(track.releaseYear) : undefined,
  genres: track.genres,
  artistImages: track.artistImages
});

// Generate a consistent color for a genre
const generateGenreColor = (genre: string): string => {
  // Create a hash of the genre name
  let hash = 0;
  for (let i = 0; i < genre.length; i++) {
    hash = genre.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to HSL color
  const h = Math.abs(hash % 360);
  return `hsl(${h}, 70%, 50%)`;
};

// Function to get playlist insights from the tracks data
const generatePlaylistInsights = (tracks: ConversionTrack[]): PlaylistStats => {
  const artistCounts: Record<string, number> = {};
  const artistImages: Record<string, string> = {};
  const genreCounts: Record<string, number> = {};
  const yearCounts: Record<string, number> = {};
  const albumCounts: Record<string, number> = {};
  const genres = new Set<string>();
  let totalTracks = tracks.length;
  let explicitCount = 0;
  let nonExplicitCount = 0;
  let validPopularityCount = 0;
  let totalPopularity = 0;
  let totalDuration = 0;
  let longestTrackDuration = 0;
  let shortestTrackDuration = Infinity;
  let longestTrack: ConversionTrack | null = null;
  let shortestTrack: ConversionTrack | null = null;
  let mostPopularTrack: ConversionTrack | null = null;
  let leastPopularTrack: ConversionTrack | null = null;
  let highestPopularity = 0;
  let lowestPopularity = 100;
  let oldestYear = '9999';
  let newestYear = '0';
  let oldestTrack: ConversionTrack | null = null;
  let newestTrack: ConversionTrack | null = null;
  
  // Duration categories
  const durationCategories = {
    short: 0, // < 3 min
    medium: 0, // 3-5 min
    long: 0, // > 5 min
  };
  
  // Popularity ranges
  const popularityRanges = {
    low: 0, // 0-33
    medium: 0, // 34-66
    high: 0, // 67-100
  };
  
  // Process each track
  tracks.forEach(track => {
    // Process artists
    track.artists.forEach((artist, index) => {
      artistCounts[artist] = (artistCounts[artist] || 0) + 1;
      if (track.artistImages?.[index] && !artistImages[artist]) {
        artistImages[artist] = track.artistImages[index];
      }
    });
    
    // Process genres
    if (track.genres) {
      track.genres.forEach(genre => {
        genres.add(genre);
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
    
    // Process duration
    if (track.duration_ms) {
      totalDuration += track.duration_ms;
      const durationMinutes = track.duration_ms / 1000 / 60;
      if (durationMinutes < 3) durationCategories.short++;
      else if (durationMinutes <= 5) durationCategories.medium++;
      else durationCategories.long++;
      
      if (track.duration_ms > longestTrackDuration) {
        longestTrackDuration = track.duration_ms;
        longestTrack = track;
      }
      if (track.duration_ms < shortestTrackDuration) {
        shortestTrackDuration = track.duration_ms;
        shortestTrack = track;
      }
    }
    
    // Process popularity
    if (track.popularity !== undefined) {
      totalPopularity += track.popularity;
      validPopularityCount++;
      if (track.popularity <= 33) popularityRanges.low++;
      else if (track.popularity <= 66) popularityRanges.medium++;
      else popularityRanges.high++;
      
      if (track.popularity > highestPopularity) {
        highestPopularity = track.popularity;
        mostPopularTrack = track;
      }
      if (track.popularity < lowestPopularity) {
        lowestPopularity = track.popularity;
        leastPopularTrack = track;
      }
    }
    
    // Process release year
    if (track.releaseYear) {
      const year = track.releaseYear.toString();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      if (year < oldestYear) {
        oldestYear = year;
        oldestTrack = track;
      }
      if (year > newestYear) {
        newestYear = year;
        newestTrack = track;
      }
    }
    
    // Process explicit content
    if (track.explicit) explicitCount++;
    else nonExplicitCount++;
    
    // Process albums
    if (track.album) {
      albumCounts[track.album] = (albumCounts[track.album] || 0) + 1;
    }
  });
  
  // Calculate genre percentages
  const genrePercentages: Record<string, number> = {};
  const totalGenreMentions = Object.values(genreCounts).reduce((a, b) => a + b, 0);
  Object.entries(genreCounts).forEach(([genre, count]) => {
    genrePercentages[genre] = (count / totalGenreMentions) * 100;
  });
  
  // Calculate yearly trends
  const yearlyTrends = Object.entries(yearCounts)
    .map(([year, count]) => ({
      year,
      count,
      avgPopularity: tracks
        .filter(t => t.releaseYear?.toString() === year && t.popularity !== undefined)
        .reduce((acc, t) => acc + (t.popularity || 0), 0) / count
    }))
    .sort((a, b) => a.year.localeCompare(b.year));
  
  // Calculate decade distribution
  const decadeDistribution: Record<string, number> = {};
  Object.entries(yearCounts).forEach(([year, count]) => {
    const decade = year.slice(0, 3) + '0';
    decadeDistribution[decade] = (decadeDistribution[decade] || 0) + count;
  });
  
  // Convert genres to array with colors
  const genreArray = Array.from(genres).map(name => ({
    name,
    count: genreCounts[name],
    color: generateGenreColor(name),
    percentage: genrePercentages[name]
  })).sort((a, b) => b.count - a.count);
  
  // Convert artists to array with images
  const artistArray = Object.entries(artistCounts)
    .map(([name, count]) => ({
      name,
      count,
      image: artistImages[name],
      popularity: tracks.find(t => t.artists.includes(name))?.popularity
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 artists
  
  // Convert albums to array
  const albumArray = Object.entries(albumCounts)
    .map(([name, trackCount]) => {
      const track = tracks.find(t => t.album === name);
      const year = track?.releaseYear ? Number(track.releaseYear) : undefined;
      return { 
        name, 
        trackCount,
        year: !isNaN(year as number) ? year : undefined
      };
    })
    .sort((a, b) => b.trackCount - a.trackCount)
    .slice(0, 5); // Top 5 albums
  
  return {
    totalTracks,
    avgPopularity: validPopularityCount ? totalPopularity / validPopularityCount : 0,
    totalDuration: Math.round(totalDuration / 60000), // Convert to minutes
    genres: genreArray,
    topArtists: artistArray,
    releaseYears: yearCounts,
    totalGenreMentions,
    mostPopularTrack: mostPopularTrack ? convertTrack(mostPopularTrack) : undefined,
    leastPopularTrack: leastPopularTrack ? convertTrack(leastPopularTrack) : undefined,
    longestTrack: longestTrack ? convertTrack(longestTrack) : undefined,
    shortestTrack: shortestTrack ? convertTrack(shortestTrack) : undefined,
    explicitCount,
    nonExplicitCount,
    topAlbums: albumArray,
    avgTrackLength: totalDuration / totalTracks,
    oldestTrack: oldestTrack ? convertTrack(oldestTrack) : undefined,
    newestTrack: newestTrack ? convertTrack(newestTrack) : undefined,
    explicitPercentage: (explicitCount / totalTracks) * 100,
    uniqueArtists: Object.keys(artistCounts).length,
    uniqueAlbums: Object.keys(albumCounts).length,
    decadeDistribution,
    // New fields
    genrePercentages,
    yearlyTrends,
    durationCategories,
    popularityRanges,
  };
};

// Helper function to calculate distribution array
const calculateDistributionArray = (values: number[], buckets: number): { range: string; count: number }[] => {
  if (values.length === 0) return [];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const bucketSize = range / buckets;
  const distribution: { range: string; count: number }[] = [];
  
  values.forEach(value => {
    const bucketIndex = Math.min(Math.floor((value - min) / bucketSize), buckets - 1);
    const bucketKey = `${Math.round(min + bucketIndex * bucketSize)}-${Math.round(min + (bucketIndex + 1) * bucketSize)}`;
    const existingBucket = distribution.find(d => d.range === bucketKey);
    if (existingBucket) {
      existingBucket.count++;
    } else {
      distribution.push({ range: bucketKey, count: 1 });
    }
  });
  
  return distribution;
};

// Extract URL utility function
const extractPlaylistId = (url: string, platform: PlatformKey): string | null => {
  if (!url) return null;
  
  try {
    if (platform === 'spotify') {
      // Handle URLs like https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd?si=abc123
      // or spotify:playlist:37i9dQZF1DX0XUsuxWHRQd
      let match = url.match(/spotify\.com\/playlist\/([a-zA-Z0-9_-]+)/);
      if (!match && url.includes('spotify:playlist:')) {
        match = url.match(/spotify:playlist:([a-zA-Z0-9_-]+)/);
      }
      if (match && match[1]) {
        // Remove any trailing query params or slashes
        return match[1].split(/[/?#]/)[0];
      }
      
      // Try direct ID format (if the user just pasted the ID)
      if (/^[a-zA-Z0-9]{22}$/.test(url)) {
        return url;
      }
    } else if (platform === 'youtube') {
      // Handle URLs like https://www.youtube.com/playlist?list=PLw-VjHDlEOgvtnnnqWlTqryAtBXmZCujo
      const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return match[1];
      }
      
      // Try direct ID format (if the user just pasted the ID)
      if (/^[a-zA-Z0-9_-]{24,34}$/.test(url)) {
        return url;
      }
    }
  } catch (error) {
    console.error("Error extracting playlist ID:", error);
  }
  
  return null;
};

interface MobileConverterProps {
  // Props for mobile-specific behavior
}

// Toast type
type ToastType = "success" | "error" | "warning" | "info";

// ProfileContentProps interface
interface ProfileContentProps {
  showEditProfile: boolean;
  setShowEditProfile: (show: boolean) => void;
  profileImage: string | null;
  isUploadingImage: boolean;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  user: any;
  state: any;
  onShowToast: (type: ToastType, message: string) => void;
  setActiveTab: React.Dispatch<React.SetStateAction<'connections' | 'converter' | 'history' | 'profile'>>;
  setConversionStep: React.Dispatch<React.SetStateAction<'select-source' | 'select-destination' | 'select-playlist' | 'converting' | 'success'>>;
  signOut: () => void;
}

// ProfileContent component
const ProfileContent: React.FC<ProfileContentProps> = ({
  showEditProfile,
  setShowEditProfile,
  profileImage,
  isUploadingImage,
  handleImageUpload,
  user,
  state,
  onShowToast,
  setActiveTab,
  setConversionStep,
  signOut
}) => {
  const [userStats, setUserStats] = useState({
    conversions: 0,
    tracks: 0,
    monthlyUsage: 0,
    monthlyLimit: 10, // Default to free tier limit
    platformUsage: {
      spotify: 0,
      youtube: 0,
      soundcloud: 0
    },
    successRate: 0,
    totalPlaylists: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Debug log to verify ProfileContent is being rendered
  

  // Load user stats from profile service
  useEffect(() => {
    const loadUserStats = async () => {
      if (!user?.uid) {
        console.log('[ProfileContent] No user UID available for loading stats');
        return;
      }
      
      console.log('[ProfileContent] Loading user stats for UID:', user.uid);
      setIsLoadingStats(true);
      
      try {
        console.log('[ProfileContent] Calling profileService.getUserStats...');
        const stats = await profileService.getUserStats(user.uid);
        console.log('[ProfileContent] User stats loaded successfully:', stats);
        setUserStats(stats);
      } catch (error) {
        console.error('[ProfileContent] Error loading user stats:', error);
        // Keep default values if loading fails
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadUserStats();
  }, [user?.uid]);

  const handleNewConversion = () => {
    setActiveTab('converter');
    onShowToast?.('info', 'Starting new conversion...');
  };

  const handleViewHistory = () => {
    setActiveTab('history');
    onShowToast?.('info', 'Opening conversion history...');
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleManageConnections = () => {
    setActiveTab('connections');
    onShowToast?.('info', 'Opening connection management...');
  };

  const handlePremiumFeatures = () => {
    onShowToast?.('info', 'Premium features coming soon...');
  };

  const handleHelpSupport = () => {
    onShowToast?.('info', 'Help & support feature coming soon...');
  };

  const handleUpgradePremium = () => {
    onShowToast?.('info', 'Premium upgrade feature coming soon...');
  };

  const handleSignOutClick = () => {
    signOut();
    onShowToast?.('success', 'Signed out successfully');
  };

  return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4 space-y-6">
      {/* User Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-600 p-6 shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-36 h-36 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-2 border-white/10">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt="Profile" 
                    className="w-36 h-36 rounded-full object-cover"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <User className={`w-20 h-20 text-white ${profileImage ? 'hidden' : ''}`} />
              </div>
              <button 
                onClick={() => document.getElementById('profile-image-input')?.click()}
                className="absolute -bottom-2 -right-2 w-11 h-11 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.displayName || 'Mich'}</h2>
              <p className="text-white/80 text-sm">Premium Member</p>
              <div className="flex items-center space-x-2 mt-1">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-white/80 text-sm">Premium Features Active</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleEditProfile}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors shadow-lg"
          >
            <Edit3 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="flex space-x-4 mt-6">
          <div className="flex-1 bg-pink-500/20 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
            <div className="flex items-center justify-center mb-2">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {isLoadingStats ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  userStats.conversions
                )}
              </div>
              <div className="text-white/80 text-sm">Total Playlists</div>
            </div>
          </div>
          <div className="flex-1 bg-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {isLoadingStats ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  userStats.tracks
                )}
              </div>
              <div className="text-white/80 text-sm">Successfully Converted</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Usage Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-bold text-white">Usage Analytics</h3>
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white font-medium">This Month</span>
            <span className="text-blue-400 font-semibold">
              {isLoadingStats ? (
                <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
              ) : (
                `${userStats.monthlyUsage}/${userStats.monthlyLimit}`
              )}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(userStats.monthlyUsage / userStats.monthlyLimit) * 100}%` }}
            />
          </div>
          <p className="text-gray-400 text-sm">
            {isLoadingStats ? (
              <div className="w-3 h-3 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin"></div>
            ) : (
              `${userStats.monthlyLimit - userStats.monthlyUsage} conversions remaining`
            )}
          </p>
        </div>
      </motion.div>

      {/* Platform Usage */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-bold text-white">Platform Usage</h3>
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <img 
                  src="/images/Spotify_Primary_Logo_RGB_White.png" 
                  alt="Spotify" 
                  style={{ 
                    height: 16, 
                    width: 'auto', 
                    objectFit: 'contain', 
                    display: 'block',
                    minWidth: '16px'
                  }} 
                  className="w-4 h-4" 
                />
              </div>
              <span className="text-white font-medium">Spotify</span>
            </div>
            <span className="text-white">{userStats.platformUsage.spotify} conversions</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <img 
                  src="/images/YouTube connection card logo.png" 
                  alt="YouTube" 
                  style={{ 
                    height: 16, 
                    width: 'auto', 
                    objectFit: 'contain', 
                    display: 'block',
                    minWidth: '16px'
                  }} 
                  className="w-4 h-4" 
                />
              </div>
              <span className="text-white font-medium">YouTube</span>
            </div>
            <span className="text-white">{userStats.platformUsage.youtube} conversions</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions - Premium Styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
        <div className="flex space-x-16">
          <motion.button
            onClick={handleNewConversion}
            className="flex-1 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm border border-white/10 shadow-xl"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">New Conversion</span>
          </motion.button>
          <motion.button
            onClick={handleViewHistory}
            className="flex-1 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-2xl p-6 flex flex-col items-center justify-center space-y-3 hover:shadow-2xl transition-all duration-300 backdrop-blur-sm border border-white/10 shadow-xl"
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.4)"
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <History className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">View History</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Account Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h3 className="text-xl font-bold text-white">Account Settings</h3>
        <div className="space-y-3">
          <button
            onClick={handleEditProfile}
            className="w-full bg-gray-800 rounded-xl p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Edit3 className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="text-white font-medium">Edit Profile</div>
                <div className="text-gray-400 text-sm">Update your information</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={handleManageConnections}
            className="w-full bg-gray-800 rounded-xl p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <LinkIcon className="w-5 h-5 text-green-400" />
              <div className="text-left">
                <div className="text-white font-medium">Manage Connections</div>
                <div className="text-gray-400 text-sm">Spotify & YouTube accounts</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <img 
                  src="/images/YouTube connection card logo.png" 
                  alt="YouTube" 
                  style={{ 
                    height: 8, 
                    width: 'auto', 
                    objectFit: 'contain', 
                    display: 'block',
                    minWidth: '8px'
                  }} 
                  className="w-2 h-2" 
                />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <button
            onClick={handlePremiumFeatures}
            className="w-full bg-gray-800 rounded-xl p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Crown className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <div className="text-white font-medium">Premium Features</div>
                <div className="text-gray-400 text-sm">Advanced conversion options</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>

          <button
            onClick={handleHelpSupport}
            className="w-full bg-gray-800 rounded-xl p-4 flex items-center justify-between hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <HelpCircle className="w-5 h-5 text-orange-400" />
              <div className="text-left">
                <div className="text-white font-medium">Help & Support</div>
                <div className="text-gray-400 text-sm">Get assistance</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </motion.div>

      {/* Sign Out */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          onClick={handleSignOutClick}
          className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-600 transition-colors shadow-lg"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </motion.div>
    </div>
  );
};

export const MobileConverter: React.FC<MobileConverterProps> = React.memo((props: MobileConverterProps) => {
  // Performance optimizations
  const performanceConfig = currentPerformanceConfig;
  const { throttle, debounce, requestAnimationFrame, cancelAnimationFrame, batchUpdates } = usePerformanceOptimization({
    throttleMs: performanceConfig.throttleMouseEvents ? 32 : 16,
    maxFPS: performanceConfig.maxAnimationFPS,
    enableRAF: performanceConfig.enableComplexAnimations
  });
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  const debounceRef = useRef<NodeJS.Timeout>();
  
  // State management with reduced re-renders
  const [activeTab, setActiveTab] = useState<'connections' | 'converter' | 'history' | 'profile'>('converter');
  const [conversionStep, setConversionStep] = useState<'select-source' | 'select-destination' | 'select-playlist' | 'converting' | 'success'>('select-source');
  const [selectedSourcePlatform, setSelectedSourcePlatform] = useState<PlatformKey | null>(null);
  const [selectedDestinationPlatform, setSelectedDestinationPlatform] = useState<PlatformKey | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showAIDiscovery, setShowAIDiscovery] = useState(false);
  
  // Create a wrapper function for showToast that can be used throughout the component
  const showToastWrapper = useRef<((type: 'success' | 'error' | 'warning' | 'info', message: string) => void) | null>(null);
  
  // Context hooks
  const navigate = useNavigate();
  const { user, signOut, hasSpotifyAuth, hasYouTubeAuth, isAuthenticated, disconnectFromSpotify, disconnectFromYouTube, isConnectingSpotify, isConnectingYouTube, spotifyError, youtubeError, spotifyUserProfile, youtubeUserProfile } = useAuth();
  const { 
    state, 
    fetchSpotifyPlaylists, 
    fetchYouTubePlaylists, 
    selectPlaylist,
    startConversion,
    fetchConversionHistory,
    cancelConversion,
    dispatch 
  } = useConversion();
  const { theme, toggleTheme, isDark } = useTheme();
  
  // Memoized values to prevent unnecessary re-renders
  const spotifyPlaylists = useMemo(() => state.spotifyPlaylists || [], [state.spotifyPlaylists]);
  const youtubePlaylists = useMemo(() => state.youtubePlaylists || [], [state.youtubePlaylists]);
  const conversionHistory = useMemo(() => state.conversionHistory || [], [state.conversionHistory]);
  
  // Debounced search function with useCallback
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setSearchQuery(query);
    }, DEBOUNCE_DELAY);
  }, []);
  
  // Optimized loading state management
  const setLoadingState = useCallback((loading: boolean) => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    if (loading) {
      setIsLoading(true);
    } else {
      // Add small delay to prevent flickering
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
      }, LAZY_LOAD_DELAY);
    }
  }, []);
  
  // Memoized initialization function
  const initializeComponent = useCallback(async () => {
    setLoadingState(true);
    try {
      // Preload essential data
      await Promise.all([
        fetchSpotifyPlaylists(),
        fetchYouTubePlaylists()
      ]);
      setIsInitialized(true);
    } catch (error) {
      console.error('Initialization error:', error);
      // Note: showToast will be available after it's defined later in the component
    } finally {
      setLoadingState(false);
    }
  }, [fetchSpotifyPlaylists, fetchYouTubePlaylists, setLoadingState]);
  
  // Initialize component
  useEffect(() => {
    initializeComponent();
  }, [initializeComponent]);
  
  // Haptic feedback
  const { hapticSuccess, hapticWarning, hapticError, hapticLight, hapticMedium } = useHapticFeedback();

  // Offline status
  const { isOnline, isOffline, connectionType } = useOfflineStatus();

  // Pull to refresh
  const contentRef = useRef<HTMLDivElement>(null);
  const { isRefreshing: isPullRefreshing, pullDistance: pullToRefreshDistance, isPulling } = usePullToRefresh(contentRef, {
    onRefresh: async () => {
      // Refresh data
      await Promise.all([
        fetchSpotifyPlaylists(),
        fetchYouTubePlaylists(),
        fetchConversionHistory()
      ]);
    }
  });

  // Swipe gestures
  const swipeRef = useRef<HTMLDivElement>(null);
  const { touchStart, touchEnd } = useSwipeGestures(swipeRef, {
    onSwipeLeft: () => hapticLight(),
    onSwipeRight: () => hapticLight()
  });

  // Long press
  const { isLongPress } = useLongPress(swipeRef, {
    onLongPress: () => hapticMedium(),
    onPress: () => hapticLight()
  });

  // Swipe actions
  const historySwipeRef = useRef<HTMLDivElement>(null);
  useSwipeActions(historySwipeRef, {
    onSwipeLeft: () => {
      hapticLight();
      // Handle swipe left
    },
    onSwipeRight: () => {
      hapticLight();
      // Handle swipe right
    }
  });

  // Voice commands
  const { isListening, startListening, stopListening } = useVoiceCommands({
    commands: {
      'start conversion': () => hapticSuccess(),
      'stop conversion': () => hapticWarning(),
      'refresh': () => hapticLight()
    },
    isEnabled: false
  });

  // Scroll progress
  const { scrollDirection } = useScrollDirection();

  // Viewport logger

  // Infinite scroll

  // Show toast function

  // Set the wrapper reference

  // Handle authentication check
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  
  // These variables are already declared above from useAuth()
  
  // State management with reduced complexity
  const [isCardExpanded, setIsCardExpanded] = useState<'spotify' | 'youtube' | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [currentWizardStep, setCurrentWizardStep] = useState(1);
  const [showPlaylistSuggestions, setShowPlaylistSuggestions] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [playlistNameForExport, setPlaylistNameForExport] = useState('');
  const [playlistDescriptionForExport, setPlaylistDescriptionForExport] = useState('');
  
  // Conversion process state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  // Dynamic estimated time based on conversion progress
  const estimatedTime = useMemo(() => {
    if (state.status === ConversionStatus.IDLE) return "Ready to convert";
    if (state.status === ConversionStatus.LOADING_TRACKS) return "Loading tracks...";
    if (state.status === ConversionStatus.MATCHING_TRACKS) {
      const remainingTracks = state.tracks.length - Math.floor((state.matchingProgress / 100) * state.tracks.length);
      const estimatedSeconds = remainingTracks * 2; // Rough estimate: 2 seconds per track
      if (estimatedSeconds < 60) return `${estimatedSeconds}s remaining`;
      const minutes = Math.ceil(estimatedSeconds / 60);
      return `${minutes} min remaining`;
    }
    if (state.status === ConversionStatus.CREATING_PLAYLIST) return "Creating playlist...";
    if (state.status === ConversionStatus.SUCCESS) return "Conversion complete!";
    if (state.status === ConversionStatus.PARTIAL_SUCCESS) return "Converted with some issues";
    if (state.status === ConversionStatus.ERROR) return "Stopped";
    return "Processing...";
  }, [state.status, state.matchingProgress, state.tracks.length]);
  
  // Enhanced conversion progress data - derived from real conversion state
  const matchedSongs = useMemo(() => {
    if (!state.tracks || !state.matches) return [];
    
    return state.tracks
      .filter(track => {
        const match = state.matches.get(track.id);
        return match && match.score > 0.7; // Only show high-confidence matches
      })
      .map(track => {
        const match = state.matches.get(track.id);
        return {
          title: track.name,
          artist: track.artists.join(', '),
          confidence: Math.round((match?.score || 0) * 100),
        };
      })
      .slice(0, 5); // Show top 5 matches
  }, [state.tracks, state.matches]);
  
  const processingSongs = useMemo(() => {
    if (!state.tracks || !state.matches) return [];
    
    return state.tracks
      .filter(track => {
        const match = state.matches.get(track.id);
        return match && match.score > 0.3 && match.score <= 0.7; // Medium confidence matches
      })
      .map(track => ({
        title: track.name,
        artist: track.artists.join(', '),
      }))
      .slice(0, 3); // Show top 3 processing
  }, [state.tracks, state.matches]);
  
  const issuesSongs = useMemo(() => {
    if (!state.tracks || !state.matches) return [];
    
    return state.tracks
      .filter(track => {
        const match = state.matches.get(track.id);
        return !match || match.score <= 0.3; // Low confidence or no match
      })
      .map(track => {
        const match = state.matches.get(track.id);
        return {
          title: track.name,
          artist: track.artists.join(', '),
          issue: !match ? 'No match found' : 'Low confidence match',
        };
      })
      .slice(0, 3); // Show top 3 issues
  }, [state.tracks, state.matches]);
  
  // Enhanced UI state with reduced animations
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false); // Disabled by default
  const [pulseAnimation, setPulseAnimation] = useState(false);
  
  // Mobile enhancement hooks
  const tabSwipeRef = useRef<HTMLDivElement>(null);
  
  // Scroll behavior and animations
  const { scrollProgress, isScrolling, handleScroll, scrollToTop } = useScrollProgress({
    containerRef: contentRef,
    onProgressChange: (progress) => {
      // Optional: Add any additional progress-based logic here
    }
  });
  
  // Viewport analysis for optimization
  const viewportAnalysis = useViewportLogger();
  
  // Infinite scroll functionality
  const [hasMoreContent, setHasMoreContent] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const loadMoreContent = useCallback(async () => {
    if (isLoadingMore || !hasMoreContent) return;
    
    setIsLoadingMore(true);
    try {
      // Simulate loading more content
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, we'll just simulate infinite content
      // In a real app, this would load more data from an API
      setHasMoreContent(true); // Keep it infinite for demo
    } catch (error) {
      console.error('Error loading more content:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreContent]);
  
  const infiniteScrollRef = useRef<HTMLDivElement>(null);
  
  // Scroll to top when tab changes
  useEffect(() => {
    scrollToTop();
  }, [activeTab, scrollToTop]);
  
  // Auto-update conversion step based on conversion status
  useEffect(() => {
    if (state.status === ConversionStatus.MATCHING_TRACKS || 
        state.status === ConversionStatus.CREATING_PLAYLIST) {
      setConversionStep('converting');
    } else if (state.status === ConversionStatus.SUCCESS || state.status === ConversionStatus.PARTIAL_SUCCESS) {
      setConversionStep('success');
    }
  }, [state.status]);
  
  // Real-time conversion progress updates
  useEffect(() => {
    if (state.status === ConversionStatus.MATCHING_TRACKS || 
        state.status === ConversionStatus.CREATING_PLAYLIST) {
      setConversionProgress(state.matchingProgress);
    } else if (state.status === ConversionStatus.LOADING_TRACKS) {
      const pre = Math.max(1, Math.min(50, Math.round(state.matchingProgress)));
      setConversionProgress(pre);
    } else if (state.status === ConversionStatus.SUCCESS || state.status === ConversionStatus.PARTIAL_SUCCESS) {
      setConversionProgress(100);
    } else {
      setConversionProgress(0);
    }
  }, [state.status, state.matchingProgress]);
  
  // Reduced welcome animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeAnimation(false);
    }, 1000); // Reduced from 2000ms
    return () => clearTimeout(timer);
  }, []);
  
  // Swipe gestures for tab navigation
  useSwipeGestures(tabSwipeRef, {
    onSwipeLeft: () => {
      const tabs = ['converter', 'connections', 'history', 'profile'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex] as any);
      hapticLight();
    },
    onSwipeRight: () => {
      const tabs = ['converter', 'connections', 'history', 'profile'];
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prevIndex] as any);
      hapticLight();
    }
  }, {
    minSwipeDistance: 80,
    maxSwipeTime: 500,
    preventDefault: false
  });
  
  // Pull to refresh functionality
  const { isRefreshing, pullDistance } = usePullToRefresh(contentRef, {
    onRefresh: async () => {
      hapticSuccess();
      await fetchConversionHistory();
      if (hasSpotifyAuth) await fetchSpotifyPlaylists();
      if (hasYouTubeAuth) await fetchYouTubePlaylists();
    }
  });
  
  // Long press for quick actions
  const longPressRef = useRef<HTMLDivElement>(null);
  useLongPress(longPressRef, {
    onLongPress: () => {
      hapticMedium();
      showToastWrapper.current?.('info', 'Quick actions available on long press!');
    }
  });
  
  // Swipe actions for history items (using existing historySwipeRef)
  useSwipeActions(historySwipeRef, {
    threshold: 100,
    onSwipeLeft: () => {
      hapticLight();
      showToastWrapper.current?.('info', 'Swipe left to delete conversion');
    },
    onSwipeRight: () => {
      hapticLight();
      showToastWrapper.current?.('info', 'Swipe right to share conversion');
    }
  });
  
  // Voice commands
  const voiceCommands = {
    'convert playlist': () => {
      hapticSuccess();
      showToastWrapper.current?.('success', 'Voice command: Convert playlist');
      setActiveTab('converter');
    },
    'show history': () => {
      hapticSuccess();
      showToastWrapper.current?.('success', 'Voice command: Show history');
      setActiveTab('history');
    },
    'connect spotify': () => {
      hapticSuccess();
      showToastWrapper.current?.('success', 'Voice command: Connect Spotify');
      connectToSpotify();
    },
    'connect youtube': () => {
      hapticSuccess();
      showToastWrapper.current?.('success', 'Voice command: Connect YouTube');
      connectToYouTube();
    }
  };
  
  // Platform selection with proper typing
  type PlatformInfo = {
    key: PlatformKey;
    label: string;
    color: string;
    icon: any;
  };
  
  const platforms = useMemo<PlatformInfo[]>(() => [
    { key: 'spotify', label: 'Spotify', color: 'bg-green-500', icon: FaSpotify },
    { key: 'youtube', label: 'YouTube', color: 'bg-red-500', icon: Youtube },
  ], []);
  
  // State with proper typing
  const [sourcePlatform, setSourcePlatform] = useState<PlatformKey>('spotify');
  const [destinationPlatform, setDestinationPlatform] = useState<PlatformKey>('youtube');
  
  // Form state
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  // Ensure destination is never the same as source
  useEffect(() => {
    if (destinationPlatform === sourcePlatform) {
      const next = platforms.find(p => p.key !== sourcePlatform);
      if (next) setDestinationPlatform(next.key);
    }
    
    // Save platform selections to localStorage for persistence
    localStorage.setItem('source_platform', sourcePlatform);
    localStorage.setItem('destination_platform', destinationPlatform);
  }, [sourcePlatform, destinationPlatform, platforms]);
  
  // Restore saved platform selections on initial load
  useEffect(() => {
    const savedSource = localStorage.getItem('source_platform');
    const savedDestination = localStorage.getItem('destination_platform');
    const lastPlaylistUrl = localStorage.getItem('last_playlist_url');
    
    if (savedSource && platforms.some(p => p.key === savedSource as PlatformKey)) {
      setSourcePlatform(savedSource as PlatformKey);
    }
    
    if (savedDestination && platforms.some(p => p.key === savedDestination as PlatformKey) && savedDestination !== sourcePlatform) {
      setDestinationPlatform(savedDestination as PlatformKey);
    }
    
    if (lastPlaylistUrl) {
      setSpotifyUrl(lastPlaylistUrl);
    }
  }, [platforms, sourcePlatform]);
  
  // Set the document title
  useEffect(() => {
    document.title = `Playlist Converter - Convert ${platforms.find(p => p.key === sourcePlatform)?.label} to ${platforms.find(p => p.key === destinationPlatform)?.label}`;
  }, [sourcePlatform, destinationPlatform, platforms]);
  
  // Fetch conversion history when user is authenticated
  const hasFetchedHistory = useRef(false);
  useEffect(() => {
    if (isAuthenticated && !hasFetchedHistory.current) {
      hasFetchedHistory.current = true;
      const loadHistory = async () => {
        try {
          await fetchConversionHistory();
        } catch (error) {
          console.error('Error loading conversion history:', error);
        }
      };
      loadHistory();
    }
  }, [isAuthenticated, fetchConversionHistory]);
  
  // Set default playlist name and description when a playlist is selected
  useEffect(() => {
    if (state.selectedPlaylistId && state.spotifyPlaylists) {
      const selectedPlaylistItem = state.spotifyPlaylists.find((p: any) => p.id === state.selectedPlaylistId);
      if (selectedPlaylistItem) {
        setPlaylistNameForExport(`${selectedPlaylistItem.name} (Converted)`);
        setPlaylistDescriptionForExport(`Converted from ${sourcePlatform} using SoundSwapp`);
      }
    }
  }, [state.selectedPlaylistId, state.spotifyPlaylists, sourcePlatform]);
  
  // Show celebration when conversion is successful
  useEffect(() => {
    if (state.status === ConversionStatus.SUCCESS) {
      setShowCelebration(true);
      setIsProcessing(false);
      
      // Determine destination platform and use appropriate playlist URL
      const destinationIsSpotify = destinationPlatform === 'spotify';
      let playlistUrl = destinationIsSpotify 
        ? state.spotifyPlaylistUrl 
        : state.youtubePlaylistUrl;
      
      // If playlist URL is null, try to get it from conversion history
      if (!playlistUrl && state.conversionHistory.length > 0) {
        const latestConversion = state.conversionHistory[0];
        if (destinationIsSpotify) {
          playlistUrl = latestConversion.spotifyPlaylistUrl || null;
        } else {
          playlistUrl = latestConversion.youtubePlaylistUrl || null;
        }
        console.log('[MobileConverter] Retrieved playlist URL from conversion history on success:', playlistUrl);
      }
      
      console.log('[MobileConverter] Conversion success - URL debugging:', {
        destinationPlatform,
        destinationIsSpotify,
        spotifyPlaylistUrl: state.spotifyPlaylistUrl,
        youtubePlaylistUrl: state.youtubePlaylistUrl,
        finalPlaylistUrl: playlistUrl,
        hasSpotifyUrl: !!state.spotifyPlaylistUrl,
        hasYouTubeUrl: !!state.youtubePlaylistUrl,
        conversionHistoryLength: state.conversionHistory.length,
        latestConversion: state.conversionHistory[0]
      });
      
      const platformName = destinationIsSpotify ? 'Spotify' : 'YouTube';
      
      addToast({
        type: 'success',
        title: 'Conversion Complete',
        message: `Your playlist has been successfully converted to ${platformName}!`,
        actionLabel: 'View Playlist',
        onAction: () => {
          console.log('[MobileConverter] Toast View Playlist action clicked:', {
            playlistUrl,
            platformName,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          });
          
          if (playlistUrl) {
            let success = openUrlOnMobile(playlistUrl);
            if (!success) {
              console.warn('[MobileConverter] Toast: Primary method failed, trying alternative...');
              success = openUrlOnMobileAlternative(playlistUrl);
              if (!success) {
                console.error('[MobileConverter] Toast: Both methods failed to open playlist URL');
              }
            }
          } else {
            console.error('[MobileConverter] Toast: No playlist URL available');
          }
        }
      });
      
      // Move to success step
      setConversionStep('success');
    }
  }, [state.status, state.youtubePlaylistUrl, state.spotifyPlaylistUrl, destinationPlatform]);
  
  // Set processing state based on conversion status
  useEffect(() => {
    const processingStatuses = [
      ConversionStatus.LOADING_TRACKS,
      ConversionStatus.MATCHING_TRACKS,
      ConversionStatus.CREATING_PLAYLIST
    ];
    
    setIsProcessing(processingStatuses.includes(state.status));
  }, [state.status]);
  
  // Track errors and notify the user
  useEffect(() => {
    if (state.error) {
      addToast({
        type: 'error',
        title: 'Conversion Error',
        message: state.error || 'An error occurred during conversion.',
        actionLabel: 'Try Again'
      });
    }
  }, [state.error]);
  
  // Auto-advance Steps: Advance to step 3 when tracks are loaded after import
  useEffect(() => {
    if (currentWizardStep === 2 && state.tracks.length > 0 && !isProcessing) {
      setTimeout(() => {
        setCurrentWizardStep(3);
        // Scroll to wizard card
        document.getElementById('playlist-wizard-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
    // Save last imported playlist URL
    if (state.selectedPlaylistId && currentWizardStep === 2) {
      if (sourcePlatform === 'spotify') {
        localStorage.setItem('last_playlist_url', spotifyUrl);
      } else if (sourcePlatform === 'youtube') {
        localStorage.setItem('last_playlist_url', youtubeUrl);
      }
    }
  }, [state.tracks.length, isProcessing, currentWizardStep, state.selectedPlaylistId, spotifyUrl, youtubeUrl, sourcePlatform]);
  
  // Fetch playlists based on auth status
  useEffect(() => {
    if (isAuthenticated && hasSpotifyAuth) {
      fetchSpotifyPlaylists();
    }
  }, [isAuthenticated, hasSpotifyAuth, fetchSpotifyPlaylists]);

  // Check for duplicates when playlists are loaded (moved after addToast declaration)
  
  useEffect(() => {
    if (isAuthenticated && hasYouTubeAuth && typeof fetchYouTubePlaylists === 'function') {
      fetchYouTubePlaylists();
    }
  }, [isAuthenticated, hasYouTubeAuth, fetchYouTubePlaylists]);
  
  // Populate userPlaylists based on selected source platform
  useEffect(() => {
    if (selectedSourcePlatform === 'spotify' && state.spotifyPlaylists) {
      console.log('Setting Spotify playlists:', state.spotifyPlaylists);
      setUserPlaylists(state.spotifyPlaylists);
    } else if (selectedSourcePlatform === 'youtube' && state.youtubePlaylists) {
      console.log('Setting YouTube playlists:', state.youtubePlaylists);
      setUserPlaylists(state.youtubePlaylists);
    } else {
      setUserPlaylists([]);
    }
  }, [selectedSourcePlatform, state.spotifyPlaylists, state.youtubePlaylists]);
  
  // Toast management
  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  const addToast = useCallback(({ type, message, title, actionLabel, onAction, duration = 5000 }: Omit<Toast, 'id'> & { duration?: number }) => {
    const id = Date.now();
    const newToast: Toast = {
      id,
      type,
      title: title || '',
      message: message || '',
      actionLabel,
      onAction
    };
    
    setToasts(prev => [...prev, newToast]);
    
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, [dismissToast]);
  
  // Show different toast types
  const showToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const toastConfig = {
      success: {
        title: 'Success',
        message: message || 'Operation completed successfully!',
        actionLabel: 'Ok'
      },
      error: {
        title: 'Error',
        message: message || 'Something went wrong. Please try again.',
        actionLabel: 'Retry'
      },
      warning: {
        title: 'Warning',
        message: message || 'Some tracks might not have been matched correctly.',
        actionLabel: 'Review'
      },
      info: {
        title: 'Information',
        message: message || 'Your conversion is being processed in the background.',
        actionLabel: 'Details'
      }
    };
    
    addToast({
      type,
      title: toastConfig[type].title,
      message: toastConfig[type].message,
      actionLabel: toastConfig[type].actionLabel
    });
  }, [addToast]);
  
  // Update the wrapper to use the actual showToast function
  useEffect(() => {
    showToastWrapper.current = showToast;
  }, [showToast]);

  // Check for duplicates when playlists are loaded (moved after addToast declaration)
  useEffect(() => {
    if (state.spotifyPlaylists.length > 0) {
      const duplicates = state.spotifyPlaylists.filter(p => 
        p.name.includes('(Converted)')
      );
      
      if (duplicates.length > 0) {
        console.log('[MobileConverter] Found duplicate playlists:', duplicates.map(p => p.name));
        // Show info toast only once
        if (!localStorage.getItem('duplicate_info_shown')) {
          addToast({
            type: 'info',
            title: 'Duplicate Prevention Active',
            message: `Found ${duplicates.length} converted playlists. The app will now prevent creating duplicates.`,
            actionLabel: 'OK'
          });
          localStorage.setItem('duplicate_info_shown', 'true');
        }
      }
    }
  }, [state.spotifyPlaylists, addToast]);
  
  // Fetch playlists with proper error handling (after showToast is defined)
  useEffect(() => {
    if (selectedSourcePlatform === 'spotify' && hasSpotifyAuth && isAuthenticated) {
      setIsLoadingPlaylists(true);
      fetchSpotifyPlaylists()
        .then(() => {
          console.log('Spotify playlists fetched successfully');
        })
        .catch((error) => {
          console.error('Error fetching Spotify playlists:', error);
          showToast('error', 'Failed to load Spotify playlists. Please try again.');
        })
        .finally(() => setIsLoadingPlaylists(false));
    } else if (selectedSourcePlatform === 'youtube' && hasYouTubeAuth && isAuthenticated) {
      setIsLoadingPlaylists(true);
      fetchYouTubePlaylists()
        .then(() => {
          console.log('YouTube playlists fetched successfully');
        })
        .catch((error) => {
          console.error('Error fetching YouTube playlists:', error);
          showToast('error', 'Failed to load YouTube playlists. Please try again.');
        })
        .finally(() => setIsLoadingPlaylists(false));
    }
  }, [selectedSourcePlatform, hasSpotifyAuth, hasYouTubeAuth, isAuthenticated, fetchSpotifyPlaylists, fetchYouTubePlaylists, showToast]);
  
  // Fetch playlists when reaching playlist selection step
  useEffect(() => {
    if (conversionStep === 'select-playlist' && selectedSourcePlatform && userPlaylists.length === 0) {
      if (selectedSourcePlatform === 'spotify' && hasSpotifyAuth && isAuthenticated) {
        setIsLoadingPlaylists(true);
        fetchSpotifyPlaylists().finally(() => setIsLoadingPlaylists(false));
      } else if (selectedSourcePlatform === 'youtube' && hasYouTubeAuth && isAuthenticated) {
        setIsLoadingPlaylists(true);
        fetchYouTubePlaylists().finally(() => setIsLoadingPlaylists(false));
      }
    }
  }, [conversionStep, selectedSourcePlatform, userPlaylists.length, hasSpotifyAuth, hasYouTubeAuth, isAuthenticated, fetchSpotifyPlaylists, fetchYouTubePlaylists]);
  
  // YouTube playlists data handling
  const selectYouTubePlaylist = useCallback(async (id: string) => {
    dispatch({ type: 'SET_STATUS', payload: ConversionStatus.LOADING_TRACKS });
    setIsProcessing(true);
    
    // Select the playlist
    dispatch({ type: 'SELECT_PLAYLIST', payload: id });
    
    // Call the YouTube API to get tracks from this playlist
    const accessToken = await getYouTubeToken();
    
    if (!accessToken) {
      showToastWrapper.current?.('error', 'YouTube authentication token not found. Please reconnect.');
      setIsProcessing(false);
      return;
    }
    
    // Use a proper abort controller for the fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    fetchAllYouTubePlaylistItems(id, accessToken)
      .then(async allItems => {
        if (!allItems || allItems.length === 0) {
          console.warn('No tracks found in playlist or playlist is private/empty.');
          setIsProcessing(false);
          addToast({
            type: 'error',
            title: 'No tracks found',
            message: 'This playlist appears to be empty or private.'
          });
          return;
        }
        
        // Step 1: Collect all videoIds
        const videoIds = allItems.map((item: any) => item.snippet?.resourceId?.videoId || item.contentDetails?.videoId).filter((id) => id);
        
        // Step 2: Fetch video details in batches of 50
        const batches = [];
        for (let i = 0; i < videoIds.length; i += 50) {
          batches.push(videoIds.slice(i, i + 50));
        }
        
        let videoIdToYear: Record<string, number> = {};
        for (const batch of batches) {
          try {
            const detailsResp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${batch.join(',')}`, {
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (detailsResp.ok) {
              const detailsData = await detailsResp.json();
              detailsData.items.forEach((video: any) => {
                if (video.id && video.snippet && video.snippet.publishedAt) {
                  videoIdToYear[video.id] = parseInt(video.snippet.publishedAt.split('-')[0], 10);
                }
              });
            }
          } catch (err) {
            console.error('Error fetching video details batch:', err);
          }
        }
        
        // Step 3: Map tracks with releaseYear
        const tracks: Track[] = allItems.map((item: any) => {
          let videoTitle = item.snippet?.title || '';
          let artists = [item.snippet?.videoOwnerChannelTitle || 'Unknown'];
          let title = videoTitle;
          
          // Smart parsing of video titles to extract artist and title
          const separators = [' - ', ' – ', ': ', ' "', " '", ' // '];
          for (const separator of separators) {
            if (videoTitle.includes(separator)) {
              const parts = videoTitle.split(separator);
              if (parts.length >= 2) {
                artists = [parts[0].trim()];
                title = parts.slice(1).join(separator).trim()
                  .replace(/^['"]/, '')
                  .replace(/['"]$/, '');
                break;
              }
            }
          }
          
          const videoId = item.snippet?.resourceId?.videoId || item.contentDetails?.videoId;
          
          return {
            id: item.id || `yt-${Math.random().toString(36).substring(2, 9)}`,
            name: title,
            artists: artists,
            album: item.snippet?.channelTitle || '',
            duration_ms: 0, // YouTube API doesn't provide duration in the playlist items response
            popularity: 0,
            explicit: false,
            searchQuery: `${artists[0]} ${title}`,
            videoId,
            releaseYear: videoIdToYear[videoId]?.toString()
          };
        });
        
        dispatch({ type: 'SET_TRACKS', payload: tracks as any });
        setIsProcessing(false);
        setTimeout(() => {
          setCurrentWizardStep(3);
          document.getElementById('playlist-wizard-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      })
      .catch(error => {
        setIsProcessing(false);
        console.error('Error fetching YouTube playlist tracks:', error);
        let errorMessage = 'An error occurred trying to load the YouTube playlist.';
        
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again or check your internet connection.';
        } else if (error.message && error.message.includes('401')) {
          errorMessage = 'YouTube authorization expired. Please reconnect your YouTube account.';
        } else if (error.message && error.message.includes('403')) {
          errorMessage = 'You don\'t have permission to access this playlist.';
        } else if (error.message && error.message.includes('404')) {
          errorMessage = 'Playlist not found. It may have been deleted or set to private.';
        }
        
        addToast({
          type: 'error',
          title: 'Failed to load playlist',
          message: errorMessage
        });
      });
  }, [dispatch, addToast, showToastWrapper]);
  
  // Helper to fetch all YouTube playlist items with pagination
  async function fetchAllYouTubePlaylistItems(playlistId: string, accessToken: string) {
    let allItems: any[] = [];
    let nextPageToken = '';
    let page = 1;
    
    try {
      do {
        const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}` + (nextPageToken ? `&pageToken=${nextPageToken}` : '');
        const resp = await fetch(url, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        
        if (!resp.ok) {
          throw new Error(`YouTube API error: ${resp.status}`);
        }
        
        const data = await resp.json();
        if (data.items && data.items.length > 0) {
          allItems = allItems.concat(data.items);
        }
        
        nextPageToken = data.nextPageToken || '';
        page++;
      } while (nextPageToken);
      
      return allItems;
    } catch (err) {
      console.error('Error fetching playlist items (pagination):', err);
      return allItems;
    }
  }
  
  // Handle playlist URL submission with improved error handling
  const handlePlaylistUrlSubmit = useCallback(async (platform: PlatformKey) => {
    const url = platform === 'spotify' ? spotifyUrl : youtubeUrl;
    
    if (!url.trim()) {
      showToastWrapper.current?.('error', `Please enter a ${platform} playlist URL`);
      return;
    }
    
    try {
      const playlistId = extractPlaylistId(url, platform);
      console.log('Extracted playlist ID:', playlistId, 'from URL:', url);
      
      if (!playlistId) {
        showToastWrapper.current?.('error', `Invalid ${platform} playlist URL format`);
        return;
      }
      
      // Validate playlist ID format
      if (platform === 'spotify' && playlistId.length !== 22) {
        showToastWrapper.current?.('warning', 'The playlist ID format looks unusual, but trying anyway...');
      }
      
      showToastWrapper.current?.('info', 'Fetching playlist details...');
      setIsProcessing(true);
      
      // Select the playlist for conversion based on platform
      if (platform === 'spotify') {
        try {
          await selectPlaylist(playlistId);
          console.log('Playlist import successful for ID:', playlistId);
          setIsProcessing(false); // Explicitly set processing to false
        } catch (err: unknown) {
          console.error('Error importing playlist:', err);
          showToastWrapper.current?.('error', `Failed to import playlist: ${err instanceof Error ? err.message : String(err)}`);
          setIsProcessing(false);
        }
      } else if (platform === 'youtube') {
        selectYouTubePlaylist(playlistId);
      }
    } catch (error) {
      console.error(`Error parsing ${platform} URL:`, error);
      showToastWrapper.current?.('error', `Failed to process ${platform} URL`);
      setIsProcessing(false);
    }
  }, [spotifyUrl, youtubeUrl, selectPlaylist, selectYouTubePlaylist]);
  
  // Auth helpers
  const connectToSpotify = useCallback(() => {
    try {
      // First, explicitly check if user is authenticated
      if (!isAuthenticated) {
        console.warn('User not authenticated when trying to connect to Spotify');
        showToastWrapper.current?.('error', 'Please sign in to your account first before connecting to Spotify');
        
        // Save that user wants to connect to Spotify and redirect to login
        sessionStorage.setItem('connect_after_login', 'spotify');
        navigate('/login');
        return;
      }
      
      // Add a small delay to ensure auth state is properly propagated
      setTimeout(() => {
        initSpotifyAuth();
      }, 100);
    } catch (error) {
      console.error('Error initiating Spotify auth:', error);
      showToastWrapper.current?.('error', 'Failed to connect to Spotify');
    }
  }, [isAuthenticated, user, navigate]);
  
  const connectToYouTube = useCallback(() => {
    try {
      window.location.href = getYouTubeAuthUrl();
    } catch (error) {
      console.error('Error initiating YouTube auth:', error);
      showToastWrapper.current?.('error', 'Failed to connect to YouTube');
    }
  }, []);
  
  // Determine current conversion step
  const getCurrentStep = useCallback(() => {
    switch (state.status) {
      case ConversionStatus.LOADING_PLAYLISTS:
      case ConversionStatus.SELECTING_PLAYLIST:
      case ConversionStatus.IDLE:
        return 1;
      case ConversionStatus.LOADING_TRACKS:
        return 2;
      case ConversionStatus.MATCHING_TRACKS:
        return 3;
      case ConversionStatus.CREATING_PLAYLIST:
        return 4;
      case ConversionStatus.SUCCESS:
        return 4;
      default:
        return 1;
    }
  }, [state.status]);
  
  // Start conversion with proper error handling
  const handleStartConversion = useCallback(async () => {
    // Make sure we have a playlist selected
    if (!state.selectedPlaylistId) {
      showToastWrapper.current?.('error', 'Please select a playlist first');
      return;
    }


    
    // Make sure we have the necessary auth for both platforms
    if (sourcePlatform === 'spotify' && !hasSpotifyAuth) {
      showToastWrapper.current?.('error', 'Please connect to Spotify first');
      return;
    }
    
    if (destinationPlatform === 'youtube' && !hasYouTubeAuth) {
      showToastWrapper.current?.('error', 'Please connect to YouTube first');
      return;
    }
    
    try {
      setIsProcessing(true);
      showToastWrapper.current?.('info', 'Starting conversion process...');
      
      // Pass the playlist name and description for the new playlist
      await startConversion();
    } catch (error) {
      console.error('Error starting conversion:', error);
      setIsProcessing(false);
      
      if (error instanceof Error) {
        showToastWrapper.current?.('error', `Conversion failed: ${error.message}`);
      } else {
        showToastWrapper.current?.('error', 'Conversion failed. Please try again.');
      }
    }
  }, [
    state.selectedPlaylistId,
    sourcePlatform,
    destinationPlatform,
    hasSpotifyAuth,
    hasYouTubeAuth,
    startConversion
  ]);
  
  // Add new effect to auto-connect after login
  useEffect(() => {
    // Check if we need to auto-connect after login
    if (isAuthenticated && !isProcessing) {
      const connectAfterLogin = sessionStorage.getItem('connect_after_login');
      
      if (connectAfterLogin) {
        console.log('Auto-connecting to', connectAfterLogin, 'after login');
        
        // Clear the stored value to prevent repeated attempts
        sessionStorage.removeItem('connect_after_login');
        
        // Short delay to ensure auth state has propagated
        setTimeout(() => {
          if (connectAfterLogin === 'spotify') {
            connectToSpotify();
          } else if (connectAfterLogin === 'youtube') {
            connectToYouTube();
          }
        }, 1000);
      }
    }
  }, [isAuthenticated, isProcessing, connectToSpotify, connectToYouTube]);
  
  // Get current auth status based on source and destination platforms
  const getAuthStatus = useCallback(() => {
    const sourceAuth = sourcePlatform === 'spotify' ? hasSpotifyAuth : hasYouTubeAuth;
    const destinationAuth = destinationPlatform === 'spotify' ? hasSpotifyAuth : hasYouTubeAuth;
    
    return { sourceAuth, destinationAuth };
  }, [sourcePlatform, destinationPlatform, hasSpotifyAuth, hasYouTubeAuth]);
  
  // Determine which connection handlers to use based on platforms
  const getConnectionHandlers = useCallback(() => {
    return {
      connectToSource: sourcePlatform === 'spotify' ? connectToSpotify : connectToYouTube,
      connectToDestination: destinationPlatform === 'spotify' ? connectToSpotify : connectToYouTube
    };
  }, [sourcePlatform, destinationPlatform, connectToSpotify, connectToYouTube]);
  
  // Get auth status for current platforms
  const { sourceAuth, destinationAuth } = getAuthStatus();
  
  // Get appropriate connection handlers
  const { connectToSource, connectToDestination } = getConnectionHandlers();
  
  // Get selected playlist
  const selectedPlaylistData = useMemo(() => {
    if (sourcePlatform === 'spotify') {
      return state.spotifyPlaylists?.find((p: any) => p.id === state.selectedPlaylistId);
    }
    
    return (state.youtubePlaylists || [])
      .find((p: YouTubePlaylist) => p.id === state.selectedPlaylistId);
  }, [state.spotifyPlaylists, state.youtubePlaylists, state.selectedPlaylistId, sourcePlatform]);
  
  // Define step data for the wizard
  const wizardSteps = useMemo(() => [
    {
      number: 1,
      label: 'Select Source',
      help: 'Choose the platform you want to import your playlist from (Spotify or YouTube).',
      icon: <Settings size={24} />,
      className: 'text-white'  // Always white since background is dark
    },
    {
      number: 2,
      label: 'Import Playlist',
      help: 'Paste your playlist URL or select from your library to import tracks.',
      icon: <Upload size={24} />,
      className: 'text-white'
    },
    {
      number: 3,
      label: 'Review Tracks',
      help: 'Review the imported tracks and make sure everything looks correct.',
      icon: <Music size={24} />,
      className: 'text-white'
    },
    {
      number: 4,
      label: 'Export Playlist',
      help: 'Export your playlist to the destination platform with one click.',
      icon: <Download size={24} />,
      className: 'text-white'
    }
  ], []);
  
  // Function to reset the converter (for "Convert Another" button)
  const resetConverter = useCallback(() => {
    // Reset form values
    setSpotifyUrl('');
    setYoutubeUrl('');
    setPlaylistNameForExport('');
    setPlaylistDescriptionForExport('');
    
    // Reset state
    setCurrentWizardStep(1);
    setIsProcessing(false);
    
    // Reset conversion context
    dispatch({ type: 'RESET' });
  }, [dispatch]);
  
  // Function to handle logout or connect missing services
  const handleLogoutOrConnectMissing = useCallback(() => {
    if (hasSpotifyAuth && hasYouTubeAuth) {
      signOut();
    } else if (!hasSpotifyAuth && !hasYouTubeAuth) {
      connectToSpotify();
    } else if (!hasSpotifyAuth) {
      connectToSpotify();
    } else {
      connectToYouTube();
    }
  }, [hasSpotifyAuth, hasYouTubeAuth, signOut, connectToSpotify, connectToYouTube]);
  
  const steps = [
    { id: 'source', label: 'Select Source', icon: <Music className="w-5 h-5" /> },
    { id: 'import', label: 'Import Playlist', icon: <Upload className="w-5 h-5" /> },
    { id: 'review', label: 'Review Tracks', icon: <Settings className="w-5 h-5" /> },
    { id: 'export', label: 'Export Playlist', icon: <Download className="w-5 h-5" /> }
  ];
  
  // Fetch profile image on component mount
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        // Try to get profile image from user data or localStorage
        const storedImage = localStorage.getItem('user_profile_image');
        if (storedImage) {
          setProfileImage(storedImage);
        } else if (user?.photoURL) {
          setProfileImage(user.photoURL);
        }
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    };
    fetchProfileImage();
  }, [user]);
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      // Create a preview URL
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      
      // Store in localStorage for persistence
      localStorage.setItem('user_profile_image', imageUrl);
      
      showToastWrapper.current?.('success', 'Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      showToastWrapper.current?.('error', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  const renderConverterContent = () => (
    <div className="space-y-6 font-sf-pro">
      {/* Premium Mobile Step Navigation */}
      <div className="w-full flex justify-center py-2">
        <div className="bg-surface-card/98 backdrop-blur-2xl border border-border-default/40 shadow-sm rounded-xl p-3 w-full max-w-sm">
          <div className="flex items-center justify-between">
            {/* Step 1: Select Source */}
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "relative w-12 h-12 rounded-full transition-all duration-300 mb-2",
                conversionStep === 'select-source' 
                  ? "bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] shadow-lg shadow-[#FF007A]/20" 
                  : "bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80"
              )}>
                {/* Halo effect for active step */}
                {conversionStep === 'select-source' && (
                  <motion.div
                    className="absolute -inset-1 rounded-full pointer-events-none opacity-50"
                    animate={{
                      boxShadow: [
                        "0 0 8px rgba(255, 122, 89, 0.3), 0 0 16px rgba(255, 0, 122, 0.2)",
                        "0 0 10px rgba(255, 0, 122, 0.3), 0 0 20px rgba(0, 196, 204, 0.2)",
                        "0 0 12px rgba(0, 196, 204, 0.3), 0 0 24px rgba(255, 209, 102, 0.2)",
                        "0 0 8px rgba(255, 122, 89, 0.3), 0 0 16px rgba(255, 0, 122, 0.2)"
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                {conversionStep === 'select-source' && (
                  <div className="absolute inset-2 bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] rounded-full"></div>
                )}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-full h-full",
                  conversionStep === 'select-source' ? "text-white" : "text-gray-600 dark:text-gray-400"
                )}>
                  <Settings className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            <div className="w-4 h-0.5 bg-border-default/40 mx-1" />
            
            {/* Step 2: Import Playlist */}
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "relative w-12 h-12 rounded-full transition-all duration-300 mb-2",
                conversionStep === 'select-destination' 
                  ? "bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] shadow-lg shadow-[#FF007A]/20" 
                  : "bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80"
              )}>
                {/* Halo effect for active step */}
                {conversionStep === 'select-destination' && (
                  <motion.div
                    className="absolute -inset-1 rounded-full pointer-events-none opacity-50"
                    animate={{
                      boxShadow: [
                        "0 0 8px rgba(255, 122, 89, 0.3), 0 0 16px rgba(255, 0, 122, 0.2)",
                        "0 0 10px rgba(255, 0, 122, 0.3), 0 0 20px rgba(0, 196, 204, 0.2)",
                        "0 0 12px rgba(0, 196, 204, 0.3), 0 0 24px rgba(255, 209, 102, 0.2)",
                        "0 0 8px rgba(255, 122, 89, 0.3), 0 0 16px rgba(255, 0, 122, 0.2)"
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                {conversionStep === 'select-destination' && (
                  <div className="absolute inset-2 bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] rounded-full"></div>
                )}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-full h-full",
                  conversionStep === 'select-destination' ? "text-white" : "text-gray-600 dark:text-gray-400"
                )}>
                  <Upload className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            <div className="w-4 h-0.5 bg-border-default/40 mx-1" />
            
            {/* Step 3: Select Playlist */}
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "relative w-12 h-12 rounded-full transition-all duration-300 mb-2",
                conversionStep === 'select-playlist' 
                  ? "bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] shadow-lg shadow-[#FF007A]/20" 
                  : "bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80"
              )}>
                {/* Halo effect for active step */}
                {conversionStep === 'select-playlist' && (
                  <motion.div
                    className="absolute -inset-1 rounded-full pointer-events-none opacity-50"
                    animate={{
                      boxShadow: [
                        "0 0 8px rgba(255, 122, 89, 0.3), 0 0 16px rgba(255, 0, 122, 0.2)",
                        "0 0 10px rgba(255, 0, 122, 0.3), 0 0 20px rgba(0, 196, 204, 0.2)",
                        "0 0 12px rgba(0, 196, 204, 0.3), 0 0 24px rgba(255, 209, 102, 0.2)",
                        "0 0 8px rgba(255, 122, 89, 0.3), 0 0 16px rgba(255, 0, 122, 0.2)"
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                {conversionStep === 'select-playlist' && (
                  <div className="absolute inset-2 bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] rounded-full"></div>
                )}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-full h-full",
                  conversionStep === 'select-playlist' ? "text-white" : "text-gray-600 dark:text-gray-400"
                )}>
                  <ListMusic className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            <div className="w-4 h-0.5 bg-border-default/40 mx-1" />
            
            {/* Step 4: Converting */}
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "relative w-12 h-12 rounded-full transition-all duration-300 mb-2",
                conversionStep === 'converting' 
                  ? "bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] shadow-lg shadow-[#FF007A]/20" 
                  : "bg-gradient-to-br from-gray-100/80 to-gray-200/80 dark:from-gray-800/80 dark:to-gray-700/80"
              )}>
                {/* Halo effect for active step */}
                {conversionStep === 'converting' && (
                  <motion.div
                    className="absolute -inset-1 rounded-full pointer-events-none opacity-50"
                    animate={{
                      boxShadow: [
                        "0 0 8px rgba(255, 122, 89, 0.3), 0 0 16px rgba(255, 0, 122, 0.2)",
                        "0 0 10px rgba(255, 0, 122, 0.3), 0 0 20px rgba(0, 196, 204, 0.2)",
                        "0 0 12px rgba(0, 196, 204, 0.3), 0 0 24px rgba(255, 209, 102, 0.2)",
                        "0 0 8px rgba(255, 122, 89, 0.3), 0 0 16px rgba(255, 0, 122, 0.2)"
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                {conversionStep === 'converting' && (
                  <div className="absolute inset-2 bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] rounded-full"></div>
                )}
                <div className={cn(
                  "relative z-10 flex items-center justify-center w-full h-full",
                  conversionStep === 'converting' ? "text-white" : "text-gray-600 dark:text-gray-400"
                )}>
                  <Download className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Conversion Workflow Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF7A59] via-[#FF007A] to-[#00C4CC] bg-clip-text text-transparent mb-3 font-sf-pro-display">
          Convert Playlists
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto font-sf-pro-text">
          Transfer your music between platforms seamlessly
        </p>
      </motion.div>
      
      {/* Conversion Steps */}
      <AnimatePresence mode="wait">
        {conversionStep === 'select-source' && (
          <motion.div
            key="select-source"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Step Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Source</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose the platform you want to import your playlist from</p>
            </div>
            
            {/* Source Platform Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Source Platform</h3>
              
              {/* Spotify Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedSourcePlatform === 'spotify'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => {
                  setSelectedSourcePlatform('spotify');
                  setConversionStep('select-destination');
                  hapticLight();
                }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-[#1DB954] to-[#1ED760] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSpotify className="w-8 h-8 text-white drop-shadow-lg" />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Spotify</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {hasSpotifyAuth ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                  {selectedSourcePlatform === 'spotify' && (
                    <div className="w-6 h-6 bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* YouTube Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedSourcePlatform === 'youtube'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => {
                  setSelectedSourcePlatform('youtube');
                  setConversionStep('select-destination');
                  hapticLight();
                }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-[#FF0000] to-[#FF4444] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img 
                      src="/images/YouTube connection card logo.png" 
                      alt="YouTube" 
                      style={{ 
                        height: 32, 
                        width: 'auto', 
                        objectFit: 'contain', 
                        display: 'block',
                        minWidth: '32px'
                      }} 
                      className="w-8 h-8 drop-shadow-lg" 
                    />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">YouTube</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {hasYouTubeAuth ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                  {selectedSourcePlatform === 'youtube' && (
                    <div className="w-6 h-6 bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
        
        {conversionStep === 'select-destination' && (
          <motion.div
            key="select-destination"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Step Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Destination</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose where you want to export your playlist</p>
            </div>
            
            {/* Destination Platform Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Destination Platform</h3>
              
              {/* Spotify Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedDestinationPlatform === 'spotify'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => {
                  setSelectedDestinationPlatform('spotify');
                  setConversionStep('select-playlist');
                  hapticLight();
                }}
              >
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-[#1DB954] to-[#1ED760] rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaSpotify className="w-8 h-8 text-white drop-shadow-lg" />
                  </motion.div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Spotify</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {hasSpotifyAuth ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                  {selectedDestinationPlatform === 'spotify' && (
                    <div className="w-6 h-6 bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
              
              {/* YouTube Option */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  selectedDestinationPlatform === 'youtube'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                }`}
                onClick={() => {
                  setSelectedDestinationPlatform('youtube');
                  setConversionStep('select-playlist');
                  hapticLight();
                }}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#FF0000] to-[#FF4444] rounded-xl flex items-center justify-center">
                    <img 
                      src="/images/YouTube connection card logo.png" 
                      alt="YouTube" 
                      style={{ 
                        height: 32, 
                        width: 'auto', 
                        objectFit: 'contain', 
                        display: 'block',
                        minWidth: '32px'
                      }} 
                      className="w-8 h-8 drop-shadow-lg" 
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">YouTube</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {hasYouTubeAuth ? 'Connected' : 'Not connected'}
                    </p>
                  </div>
                  {selectedDestinationPlatform === 'youtube' && (
                    <div className="w-6 h-6 bg-gradient-to-br from-[#FF7A59] via-[#FF007A] to-[#00C4CC] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
            
            {/* Back Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setConversionStep('select-source');
                setSelectedDestinationPlatform(null);
                hapticLight();
              }}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
            >
              Back to Source Selection
            </motion.button>
          </motion.div>
        )}
        
        {conversionStep === 'select-playlist' && (
          <motion.div
            key="select-playlist"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Step Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Select Playlist</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose the playlist you want to convert</p>
            </div>
            
            {/* Playlist Selection */}
            <div className="space-y-4">
              {isLoadingPlaylists ? (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400">Loading playlists...</p>
                </div>
              ) : userPlaylists.length > 0 ? (
                <div className="space-y-3">
                  {(() => {
                    console.log('Rendering playlists:', userPlaylists);
                    console.log('Selected source platform:', selectedSourcePlatform);
                    userPlaylists.forEach((playlist, index) => {
                      console.log(`Playlist ${index}:`, {
                        id: playlist.id,
                        name: playlist.name || playlist.snippet?.title || 'Untitled Playlist',
                        snippet: playlist.snippet,
                        imageUrl: playlist.imageUrl,
                        tracks: playlist.tracks,
                        contentDetails: playlist.contentDetails,
                        trackCount: playlist.trackCount
                      });
                    });
                    return userPlaylists.map((playlist, index) => (
                    <motion.div
                      key={playlist.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                        state.selectedPlaylistId === playlist.id
                          ? 'border-pink-500 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-600/20 backdrop-blur-sm shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                      onClick={() => {
                        setSelectedPlaylist(playlist);
                        // Call the appropriate select function based on platform
                        if (selectedSourcePlatform === 'spotify') {
                          selectPlaylist(playlist.id);
                        } else if (selectedSourcePlatform === 'youtube') {
                          selectYouTubePlaylist(playlist.id);
                        }
                        hapticLight();
                        
                        // Show toast notification
                        showToastWrapper.current?.('info', `Starting conversion of "${playlist.name || playlist.snippet?.title || 'Playlist'}"...`);
                        
                        // Automatically start conversion after a short delay
                        setTimeout(() => {
                          setConversionStep('converting');
                          handleStartConversion();
                        }, 800);
                      }}
                    >
                      <div className="flex items-center space-x-4">
                          {(() => {
                            // Handle different image structures for Spotify vs YouTube
                            let imageUrl = playlist.imageUrl;
                            if (!imageUrl && playlist.snippet?.thumbnails?.default?.url) {
                              imageUrl = playlist.snippet.thumbnails.default.url;
                            }
                            
                            // Filter out invalid YouTube thumbnail URLs
                            if (imageUrl && (
                              imageUrl.includes('no_thumbnail.jpg')
                            )) {
                              imageUrl = null;
                            }
                            
                            return imageUrl ? (
                              <>
                                                              <img 
                                src={imageUrl} 
                                alt={`${(playlist.name || playlist.snippet?.title || 'Playlist')} cover`}
                                className="w-12 h-12 rounded-xl object-cover"
                                onError={(e) => {
                                  console.warn('Failed to load playlist thumbnail:', imageUrl);
                                  // Hide broken image and show fallback
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                                onLoad={() => {
                                  console.log('Successfully loaded playlist thumbnail:', imageUrl);
                                }}
                              />
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center hidden ${
                                  selectedSourcePlatform === 'spotify' 
                                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                                    : 'bg-gradient-to-br from-red-500 to-red-600'
                                }`}>
                                  <Music className="w-6 h-6 text-white" />
                                </div>
                              </>
                            ) : (
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                selectedSourcePlatform === 'spotify' 
                                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                                  : 'bg-gradient-to-br from-red-500 to-red-600'
                              }`}>
                                <Music className="w-6 h-6 text-white" />
                              </div>
                            );
                          })()}
                        <div className="flex-1">
                            <h4 className={`font-semibold ${
                              state.selectedPlaylistId === playlist.id
                                ? 'text-white'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {playlist.name || playlist.snippet?.title || 'Untitled Playlist'}
                            </h4>
                          <p className={`text-sm ${
                            state.selectedPlaylistId === playlist.id
                              ? 'text-white/80'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                              {(() => {
                                // Handle different track count structures for Spotify vs YouTube
                                let trackCount = 0;
                                if (playlist.tracks?.total !== undefined) {
                                  trackCount = playlist.tracks.total;
                                } else if (playlist.contentDetails?.itemCount !== undefined) {
                                  trackCount = playlist.contentDetails.itemCount;
                                } else if (playlist.trackCount !== undefined) {
                                  trackCount = playlist.trackCount;
                                }
                                
                                let ownerInfo = '';
                                if (playlist.owner) {
                                  ownerInfo = ` • ${playlist.owner}`;
                                } else if (playlist.snippet?.channelTitle) {
                                  ownerInfo = ` • ${playlist.snippet.channelTitle}`;
                                }
                                
                                return `${trackCount} tracks${ownerInfo}`;
                              })()}
                          </p>
                        </div>
                        {state.selectedPlaylistId === playlist.id ? (
                          <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </motion.div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedSourcePlatform === 'spotify' && !hasSpotifyAuth 
                      ? 'Please connect your Spotify account first'
                      : selectedSourcePlatform === 'youtube' && !hasYouTubeAuth
                      ? 'Please connect your YouTube account first'
                      : selectedSourcePlatform === 'youtube' && hasYouTubeAuth && youtubeError?.includes('quota exceeded')
                      ? 'YouTube API quota exceeded. Please try again later.'
                      : 'No playlists found. Please check your account connection.'}
                  </p>
                  {(selectedSourcePlatform === 'spotify' && !hasSpotifyAuth) || 
                   (selectedSourcePlatform === 'youtube' && !hasYouTubeAuth) ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('connections')}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-[#FF7A59] to-[#FF007A] text-white rounded-xl font-medium"
                    >
                      Connect Account
                    </motion.button>
                  ) : selectedSourcePlatform === 'youtube' && hasYouTubeAuth && youtubeError?.includes('quota exceeded') ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsLoadingPlaylists(true);
                        fetchYouTubePlaylists().finally(() => setIsLoadingPlaylists(false));
                      }}
                      className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
                    >
                      Try Again Later
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        if (selectedSourcePlatform === 'spotify' && hasSpotifyAuth) {
                          setIsLoadingPlaylists(true);
                          fetchSpotifyPlaylists().finally(() => setIsLoadingPlaylists(false));
                        } else if (selectedSourcePlatform === 'youtube' && hasYouTubeAuth) {
                          setIsLoadingPlaylists(true);
                          fetchYouTubePlaylists().finally(() => setIsLoadingPlaylists(false));
                        }
                      }}
                      className="mt-4 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
                    >
                      Retry Loading Playlists
                    </motion.button>
                  )}
                </div>
              )}
            </div>
            
            {/* URL Input Section */}
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Or Paste Playlist URL</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter a playlist URL directly</p>
              </div>
              
              <div className="space-y-3">
                {/* URL Input Field */}
                <div className="relative">
                  <input
                    type="url"
                    placeholder={`Paste ${selectedSourcePlatform === 'spotify' ? 'Spotify' : 'YouTube'} playlist URL here...`}
                    value={selectedSourcePlatform === 'spotify' ? spotifyUrl : youtubeUrl}
                    onChange={(e) => {
                      if (selectedSourcePlatform === 'spotify') {
                        setSpotifyUrl(e.target.value);
                      } else {
                        setYoutubeUrl(e.target.value);
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && selectedSourcePlatform) {
                        const url = selectedSourcePlatform === 'spotify' ? spotifyUrl : youtubeUrl;
                        if (url.trim()) {
                          handlePlaylistUrlSubmit(selectedSourcePlatform);
                        }
                      }
                    }}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A59] focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                {/* Import Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (selectedSourcePlatform) {
                      const url = selectedSourcePlatform === 'spotify' ? spotifyUrl : youtubeUrl;
                      if (url.trim()) {
                        handlePlaylistUrlSubmit(selectedSourcePlatform);
                      }
                    }
                  }}
                  disabled={!((selectedSourcePlatform === 'spotify' ? spotifyUrl : youtubeUrl).trim())}
                  className="w-full py-3 px-4 bg-gradient-to-r from-[#FF7A59] to-[#FF007A] text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import from URL
                </motion.button>
              </div>
            </div>
            
            {/* Back Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setConversionStep('select-destination');
                hapticLight();
              }}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors"
            >
              Back to Destination Selection
            </motion.button>
          </motion.div>
        )}
        
        {conversionStep === 'converting' && (
          <motion.div
            key="converting"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Conversion Progress Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Converting Playlist</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedPlaylist?.name || 'Playlist'} • {estimatedTime}
              </p>
            </div>
            
            {/* Main Progress Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF7A59] to-[#FF007A] rounded-xl flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">Conversion in Progress</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedPlaylist?.name || 'Playlist'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-[#FF7A59]">
                    {state.status === ConversionStatus.MATCHING_TRACKS ? state.matchingProgress : conversionProgress}%
                  </div>
                  <div className="text-xs text-gray-500">{estimatedTime}</div>
                  <div className="mt-2">
                    <button
                      onClick={() => cancelConversion()}
                      className="text-xs px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                  <motion.div
                    className="bg-gradient-to-r from-[#FF7A59] via-[#FF007A] to-[#00C4CC] h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${state.status === ConversionStatus.MATCHING_TRACKS ? state.matchingProgress : conversionProgress}%` 
                    }}
                    transition={{ duration: 0.5 }}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={state.status === ConversionStatus.MATCHING_TRACKS ? Math.round(state.matchingProgress) : Math.round(conversionProgress)}
                  />
                </div>
              
              {/* Conversion Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {state.tracks ? state.tracks.filter(track => {
                      const match = state.matches.get(track.id);
                      return match && match.score > 0.7;
                    }).length : 0}
                  </div>
                  <div className="text-xs text-gray-500">Matched</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {state.tracks ? state.tracks.filter(track => {
                      const match = state.matches.get(track.id);
                      return match && match.score > 0.3 && match.score <= 0.7;
                    }).length : 0}
                  </div>
                  <div className="text-xs text-gray-500">Processing</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">
                    {state.tracks ? state.tracks.filter(track => {
                      const match = state.matches.get(track.id);
                      return !match || match.score <= 0.3;
                    }).length : 0}
                  </div>
                  <div className="text-xs text-gray-500">Issues</div>
                </div>
              </div>

              {/* AI Conversion Optimizer */}
              {state.tracks && state.tracks.length > 0 && (
                <AIConversionOptimizer
                  tracks={state.tracks}
                  sourcePlatform={(selectedSourcePlatform as 'spotify' | 'youtube') || 'spotify'}
                  targetPlatform={(selectedDestinationPlatform as 'spotify' | 'youtube') || 'youtube'}
                  conversionStatus={
                    state.status === ConversionStatus.SUCCESS ? 'completed' :
                    state.status === ConversionStatus.PARTIAL_SUCCESS ? 'partial_success' :
                    state.status === ConversionStatus.ERROR ? 'failed' :
                    state.status === ConversionStatus.MATCHING_TRACKS || state.status === ConversionStatus.CREATING_PLAYLIST ? 'converting' :
                    'pending'
                  }
                  successRate={state.matches.size / state.tracks.length}
                  totalTracks={state.tracks.length}
                  convertedTracks={state.matches.size}
                  failedTracks={state.tracks.length - state.matches.size}
                  onOptimizeConversion={(optimizedTracks) => {
                    console.log('[MobileConverter] AI optimization applied:', optimizedTracks.length, 'tracks');
                    // Apply AI optimizations to the conversion process
                  }}
                  onApplyRecommendation={(recommendation) => {
                    console.log('[MobileConverter] Applying AI recommendation:', recommendation.description);
                    // Apply the AI recommendation
                  }}
                  onRetryFailedTracks={() => {
                    console.log('[MobileConverter] Retrying failed tracks with AI assistance');
                    // Retry failed tracks with AI assistance
                  }}
                />
              )}

              {/* AI Discovery Integration (Mobile) */}
              {state.status === ConversionStatus.SUCCESS && state.tracks && state.tracks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-6"
                >
                  <AIDiscoveryIntegration 
                    userTracks={state.tracks}
                    onPlaylistCreate={(suggestion) => {
                      let playlistName: string;
                      if ('title' in suggestion) {
                        playlistName = suggestion.title;
                      } else {
                        playlistName = suggestion.name;
                      }
                      showToast('success', `Created playlist: ${playlistName}`);
                      // Optionally start a new conversion with the suggested playlist
                    }}
                    onMoodPlaylistCreate={(playlist) => {
                      showToast('success', `Created mood playlist: ${playlist.mood}`);
                      // Optionally start a new conversion with the mood playlist
                    }}
                  />
                </motion.div>
              )}

              {/* Error State */}
              {state.status === ConversionStatus.ERROR && state.error && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div className="flex-1">
                      <p className="text-sm text-red-700 dark:text-red-300 font-medium">{state.error}</p>
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleStartConversion()}
                          className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-[#FF7A59] to-[#FF007A] text-white"
                        >
                          Retry
                        </button>
                        <button
                          onClick={() => setConversionStep('select-playlist')}
                          className="px-3 py-2 text-sm rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          Pick another playlist
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Matched Songs Section */}
            {matchedSongs.length > 0 && (
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h5 className="font-semibold text-gray-900 dark:text-white">Successfully Matched</h5>
                  <span className="text-sm text-gray-500">({matchedSongs.length})</span>
                </div>
                <div className="space-y-3">
                  {matchedSongs.slice(0, 3).map((song, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {song.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {song.artist}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600">{song.confidence}%</div>
                        <div className="text-xs text-gray-500">confidence</div>
                      </div>
                    </motion.div>
                  ))}
                  {matchedSongs.length > 3 && (
                    <div className="text-center text-sm text-gray-500">
                      +{matchedSongs.length - 3} more songs matched
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Processing Songs Section */}
            {processingSongs.length > 0 && (
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <h5 className="font-semibold text-gray-900 dark:text-white">Currently Processing</h5>
                  <span className="text-sm text-gray-500">({processingSongs.length})</span>
                </div>
                <div className="space-y-3">
                  {processingSongs.slice(0, 3).map((song, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {song.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {song.artist}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-blue-600">Processing</div>
                        <div className="text-xs text-gray-500">matching...</div>
                      </div>
                    </motion.div>
                  ))}
                  {processingSongs.length > 3 && (
                    <div className="text-center text-sm text-gray-500">
                      +{processingSongs.length - 3} more songs processing
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Issues Songs Section */}
            {issuesSongs.length > 0 && (
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">Issues Found</h5>
                    <span className="text-sm text-gray-500">({issuesSongs.length})</span>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/failed-tracks', {
                        state: { failedTracks: (state.conversionHistory?.[0]?.failedTracks || []) }
                      });
                    }}
                    className="text-xs text-red-600 hover:underline"
                  >
                    View details
                  </button>
                </div>
                <div className="space-y-3">
                  {issuesSongs.slice(0, 3).map((song, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {song.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {song.artist}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-red-600">Issue</div>
                        <div className="text-xs text-gray-500">{song.issue}</div>
                      </div>
                    </motion.div>
                  ))}
                  {issuesSongs.length > 3 && (
                    <div className="text-center text-sm text-gray-500">
                      +{issuesSongs.length - 3} more issues
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        
        {conversionStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Success Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Conversion Complete!</h2>
              <p className="text-gray-600 dark:text-gray-400">Your playlist has been successfully converted</p>
            </div>
            
            <div className="space-y-4">
              {/* Success Card */}
              <motion.div 
                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">Conversion Successful</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedPlaylist?.name || 'Playlist'} has been converted
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar - 100% Complete */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
                  100% complete
                </p>
              </motion.div>
              
              {/* Action Buttons */}
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {/* View Playlist Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const destinationIsSpotify = destinationPlatform === 'spotify';
                    let playlistUrl = destinationIsSpotify 
                      ? state.spotifyPlaylistUrl 
                      : state.youtubePlaylistUrl;
                    
                    // If playlist URL is null, try to get it from conversion history
                    if (!playlistUrl && state.conversionHistory.length > 0) {
                      const latestConversion = state.conversionHistory[0];
                      if (destinationIsSpotify) {
                        playlistUrl = latestConversion.spotifyPlaylistUrl || null;
                      } else {
                        playlistUrl = latestConversion.youtubePlaylistUrl || null;
                      }
                      console.log('[MobileConverter] Retrieved playlist URL from conversion history:', playlistUrl);
                    }
                    
                    console.log('[MobileConverter] View Playlist button clicked:', {
                      destinationPlatform,
                      destinationIsSpotify,
                      spotifyPlaylistUrl: state.spotifyPlaylistUrl,
                      youtubePlaylistUrl: state.youtubePlaylistUrl,
                      finalPlaylistUrl: playlistUrl,
                      conversionHistoryLength: state.conversionHistory.length,
                      latestConversion: state.conversionHistory[0],
                      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                    });
                    
                    if (playlistUrl) {
                      let success = openUrlOnMobile(playlistUrl);
                      if (!success) {
                        console.warn('[MobileConverter] Primary method failed, trying alternative...');
                        success = openUrlOnMobileAlternative(playlistUrl);
                        if (!success) {
                          console.error('[MobileConverter] Both methods failed to open playlist URL');
                        }
                      }
                    } else {
                      console.error('[MobileConverter] No playlist URL available');
                      // Show a toast to inform the user
                      if (typeof window !== 'undefined' && window.dispatchEvent) {
                        window.dispatchEvent(new CustomEvent('show-toast', {
                          detail: {
                            type: 'error',
                            title: 'Playlist URL Not Available',
                            message: 'The playlist URL is not available. Please try converting again.',
                            duration: 5000
                          }
                        }));
                      }
                    }
                    hapticMedium();
                  }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <ExternalLink className="w-5 h-5" />
                    <span>View Playlist</span>
                  </div>
                </motion.button>
                
                {/* Debug Test Button - Only show in development */}
                {process.env.NODE_ENV === 'development' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      console.log('[MobileConverter] Testing mobile URL handling...');
                      const testUrl = 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M';
                      let success = openUrlOnMobile(testUrl);
                      if (!success) {
                        console.log('[MobileConverter] Primary method failed, trying alternative...');
                        success = openUrlOnMobileAlternative(testUrl);
                      }
                      console.log('[MobileConverter] Test result:', success);
                      hapticMedium();
                    }}
                    className="w-full py-2 px-4 bg-gray-500 text-white rounded-lg text-sm"
                  >
                    Test URL Opening (Dev Only)
                  </motion.button>
                )}
                
                {/* Convert Another Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setConversionStep('select-source');
                    resetConverter();
                    hapticMedium();
                  }}
                  className="w-full py-4 px-6 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Convert Another Playlist</span>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  
  const renderConnectionsContent = () => (
    <div className="space-y-6">
      {/* Enhanced Header with Better Typography */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="relative mb-4"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FF7A59] to-[#FF007A] rounded-full flex items-center justify-center shadow-2xl">
            <LinkIcon className="w-10 h-10 text-white" />
          </div>
        </motion.div>
        
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#FF7A59] to-[#FF007A] bg-clip-text text-transparent mb-3 font-sf-pro-display">
          Platform Connections
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto font-sf-pro-text">
          Connect your music platforms to start converting playlists
        </p>
      </motion.div>
      
      {/* Mobile-Optimized Connection Cards */}
      <div className="space-y-4">
        {/* Spotify Connection Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MobileCard className="bg-gradient-to-br from-[#1DB954]/10 to-[#1DB954]/5 border-[#1DB954]/20 shadow-lg backdrop-blur-sm overflow-hidden">
            <div className="relative">
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/20 to-transparent opacity-50" />
              
              {/* Card Content */}
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-[#1DB954] to-[#1ED760] rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Show Spotify profile image when connected, else fallback to icon */}
                      {hasSpotifyAuth && spotifyUserProfile?.imageUrl ? (
                        <motion.img
                          src={spotifyUserProfile.imageUrl}
                          alt="Spotify Profile"
                          className="w-full h-full object-cover rounded-2xl"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          onError={(e) => {
                            // Hide broken image and reveal fallback icon
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            const fallback = (e.currentTarget.nextElementSibling as HTMLElement | null);
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <motion.div 
                        className={cn(
                          "absolute inset-0 flex items-center justify-center",
                          hasSpotifyAuth && spotifyUserProfile?.imageUrl ? "hidden" : ""
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaSpotify className="w-8 h-8 text-white drop-shadow-lg" />
                      </motion.div>
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white font-sf-pro-display">Spotify</h3>
                      <p className="text-sm text-muted-foreground font-sf-pro-text">
                        {hasSpotifyAuth ? 'Account linked' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <motion.div 
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                      hasSpotifyAuth 
                        ? "bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30" 
                        : "bg-gray-500/20 text-gray-600 border border-gray-500/30"
                    )}
                    animate={hasSpotifyAuth ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {hasSpotifyAuth ? 'Connected' : 'Disconnected'}
                  </motion.div>
                </div>
                
                {/* Account Details - Collapsible for Mobile */}
                {hasSpotifyAuth && spotifyUserProfile && (
                  <motion.div 
                    className="mb-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center font-sf-pro-display">
                      <Sparkles className="w-4 h-4 mr-2 text-[#1DB954]" />
                      Account Details
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium text-[#1DB954]">{spotifyUserProfile.displayName || 'Premium User'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{spotifyUserProfile.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan:</span>
                        <span className="font-medium text-[#1DB954]">Premium</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-green-600">Active</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <MobileButton
                    onClick={() => {
                      if (!hasSpotifyAuth) {
                        connectToSpotify();
                      } else {
                        disconnectFromSpotify();
                      }
                    }}
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-[#1DB954] to-[#1ED760] hover:from-[#1ED760] hover:to-[#1DB954] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] rounded-2xl border-0"
                    disabled={isConnectingSpotify}
                  >
                    {isConnectingSpotify ? (
                      <motion.div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Connecting...
                      </motion.div>
                    ) : hasSpotifyAuth ? (
                      <motion.div className="flex items-center justify-center">
                        <Unlock className="w-5 h-5 mr-3" />
                        Disconnect Spotify
                      </motion.div>
                    ) : (
                      <motion.div className="flex items-center justify-center">
                        <Lock className="w-5 h-5 mr-3" />
                        Connect Spotify
                      </motion.div>
                    )}
                  </MobileButton>
                  
                  {spotifyError && (
                    <motion.div 
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                        <p className="text-sm text-red-600 font-medium">
                          {typeof spotifyError === 'string' ? spotifyError : 'Spotify connection error'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </MobileCard>
        </motion.div>
        
        {/* YouTube Connection Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MobileCard className="bg-gradient-to-br from-[#FF0000]/10 to-[#FF0000]/5 border-[#FF0000]/20 shadow-lg backdrop-blur-sm overflow-hidden">
            <div className="relative">
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF0000]/20 to-transparent opacity-50" />
              
              {/* Card Content */}
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-[#FF0000] to-[#FF4444] rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {hasYouTubeAuth && youtubeUserProfile?.picture ? (
                        <motion.img
                          src={youtubeUserProfile.picture}
                          alt="YouTube Profile"
                          className="w-full h-full object-cover rounded-2xl"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                          onError={(e) => {
                            console.log('YouTube profile image failed to load');
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                          onLoad={() => {
                            console.log('YouTube profile image loaded successfully');
                          }}
                        />
                      ) : null}
                      <motion.div 
                        className={cn(
                          "absolute inset-0 flex items-center justify-center",
                          hasYouTubeAuth && youtubeUserProfile?.picture ? "hidden" : ""
                        )}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img 
                          src="/images/YouTube connection card logo.png" 
                          alt="YouTube" 
                          style={{ 
                            height: 32, 
                            width: 'auto', 
                            objectFit: 'contain', 
                            display: 'block',
                            minWidth: '32px'
                          }} 
                          className="w-8 h-8 drop-shadow-lg" 
                        />
                      </motion.div>
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white font-sf-pro-display">YouTube</h3>
                      <p className="text-sm text-muted-foreground font-sf-pro-text">
                        {hasYouTubeAuth ? 'Account linked' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <motion.div 
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300",
                      hasYouTubeAuth 
                        ? "bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30" 
                        : "bg-gray-500/20 text-gray-600 border border-gray-500/30"
                    )}
                    animate={hasYouTubeAuth ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {hasYouTubeAuth ? 'Connected' : 'Disconnected'}
                  </motion.div>
                </div>
                
                {/* Account Details - Collapsible for Mobile */}
                {hasYouTubeAuth && youtubeUserProfile && (
                  <motion.div 
                    className="mb-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center font-sf-pro-display">
                      <Sparkles className="w-4 h-4 mr-2 text-[#FF0000]" />
                      Channel Details
                    </h4>
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium text-[#FF0000]">{youtubeUserProfile.displayName || 'YouTube User'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-medium">{youtubeUserProfile.email || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium text-[#FF0000]">Standard</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-green-600">Active</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  <MobileButton
                    onClick={() => {
                      if (!hasYouTubeAuth) {
                        connectToYouTube();
                      } else {
                        disconnectFromYouTube();
                      }
                    }}
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-[#FF0000] to-[#FF4444] hover:from-[#FF4444] hover:to-[#FF0000] text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] rounded-2xl border-0"
                    disabled={isConnectingYouTube}
                  >
                    {isConnectingYouTube ? (
                      <motion.div className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Connecting...
                      </motion.div>
                    ) : hasYouTubeAuth ? (
                      <motion.div className="flex items-center justify-center">
                        <Unlock className="w-5 h-5 mr-3" />
                        Disconnect YouTube
                      </motion.div>
                    ) : (
                      <motion.div className="flex items-center justify-center">
                        <Lock className="w-5 h-5 mr-3" />
                        Connect YouTube
                      </motion.div>
                    )}
                  </MobileButton>
                  
                  {youtubeError && (
                    <motion.div 
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-red-600 font-medium">YouTube Connection Error</p>
                          <p className="text-red-500 text-xs mt-1">
                            {typeof youtubeError === 'string' ? youtubeError : 'YouTube connection error'}
                          </p>
                          {typeof youtubeError === 'string' && youtubeError.includes('quota exceeded') && (
                            <button
                              onClick={() => window.location.reload()}
                              className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                            >
                              Try Again Later
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </MobileCard>
        </motion.div>
      </div>
      
      {/* Enhanced Connection Status Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center"
      >
        <p className="text-sm text-muted-foreground font-sf-pro-text">
          Once connected, you can convert playlists in just a few clicks.
        </p>
      </motion.div>
    </div>
  );
  
  // Render functions
  const renderHistoryContent = () => (
    <div className="space-y-4">
      {/* Enhanced Header */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-[#FF7A59] to-[#FF007A] bg-clip-text text-transparent mb-3 font-sf-pro-display">
          Conversion History
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed max-w-sm mx-auto font-sf-pro-text">
          Track your playlist conversions and insights
        </p>
      </motion.div>
      
      {/* Enhanced Real Conversion History */}
      {state.conversionHistory && state.conversionHistory.length > 0 ? (
        <motion.div 
          ref={historySwipeRef} 
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {state.conversionHistory.slice(0, 10).map((conversion, index) => {
            const successRate = Math.round((conversion.tracksMatched / conversion.totalTracks) * 100);
            const hasFailures = conversion.tracksFailed > 0;
            const isFailed = conversion.tracksMatched === 0;
            
            return (
              <motion.div
                key={conversion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <MobileCard 
                  className={cn(
                    "shadow-lg hover:shadow-xl transition-all duration-300",
                    isFailed 
                      ? "bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20" 
                      : hasFailures
                        ? "bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20"
                        : "bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20"
                  )}
                  onClick={() => {
                    navigate(`/insights/${conversion.id}`);
                  }}
                >
                  {/* Status Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg",
                        isFailed 
                          ? "bg-gradient-to-br from-red-500 to-red-600" 
                          : hasFailures
                            ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                            : "bg-gradient-to-br from-green-500 to-green-600"
                      )}>
                        {isFailed ? (
                          <AlertTriangle className="w-4 h-4 text-white" />
                        ) : hasFailures ? (
                          <AlertCircle className="w-4 h-4 text-white" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <div className={cn(
                          "text-sm font-semibold",
                          isFailed 
                            ? "text-red-600 dark:text-red-400" 
                            : hasFailures
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-green-600 dark:text-green-400"
                        )}>
                          {isFailed ? 'Failed' : hasFailures ? 'Partial' : 'Complete'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {successRate}% Success
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Main Content */}
                  <div className="space-y-2">
                    {/* Title and platform */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                        {conversion.spotifyPlaylistName || 'Playlist Conversion'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Spotify → YouTube
                      </p>
                    </div>
                    
                    {/* Stats row */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          {conversion.tracksMatched}
                        </span>
                        <span className="text-xs text-gray-500">matched</span>
                      </div>
                      
                      {hasFailures && (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600 font-medium">
                            {conversion.tracksFailed}
                          </span>
                          <span className="text-xs text-gray-500">failed</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600 font-medium">
                          {new Date(conversion.convertedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* View Failed Tracks button */}
                    {hasFailures && (
                      <div className="pt-1">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('View Failed Tracks clicked:', conversion);
                            console.log('Failed tracks:', conversion.failedTracks);
                            navigate('/failed-tracks', { 
                              state: { 
                                failedTracks: conversion.failedTracks || [],
                                conversionId: conversion.id 
                              } 
                            });
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-xs font-medium hover:bg-red-200 dark:hover:bg-red-800/30 transition-colors"
                        >
                          <AlertTriangle size={10} />
                          View Failed ({conversion.tracksFailed})
                        </motion.button>
                      </div>
                    )}
                  </div>
                </MobileCard>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MobileCard className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/20 shadow-lg">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Conversions Yet
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Start converting your playlists to see your history here
              </p>
              <MobileButton
                onClick={() => setActiveTab('converter')}
                variant="primary"
                className="bg-gradient-to-r from-[#FF7A59] to-[#FF007A]"
              >
                Start Converting
              </MobileButton>
            </div>
          </MobileCard>
        </motion.div>
      )}
    </div>
  );
  
  const renderProfileContent = () => (
    <div className="space-y-6">
      <ProfileContent
        showEditProfile={showEditProfile}
        setShowEditProfile={setShowEditProfile}
        profileImage={profileImage}
        isUploadingImage={isUploadingImage}
        handleImageUpload={handleImageUpload}
        user={user}
        state={state}
        onShowToast={(type, message) => showToastWrapper.current?.(type, message)}
        setActiveTab={setActiveTab}
        setConversionStep={setConversionStep}
        signOut={signOut}
      />
    </div>
  );
  
  const renderContent = () => {
    switch (activeTab) {
      case 'converter':
        return renderConverterContent();
      case 'connections':
        return renderConnectionsContent();
      case 'history':
        return renderHistoryContent();
      case 'profile':
        return (
          <ProfileTab
            onShowToast={showToast}
            setActiveTab={setActiveTab}
          />
        );
      default:
        return renderConverterContent();
    }
  };
  
  // Update conversion progress based on ConversionContext state
  useEffect(() => {
    if (state.status === ConversionStatus.MATCHING_TRACKS || 
        state.status === ConversionStatus.CREATING_PLAYLIST) {
      setConversionProgress(state.matchingProgress);
    } else if (state.status === ConversionStatus.LOADING_TRACKS) {
      const pre = Math.max(1, Math.min(50, Math.round(state.matchingProgress)));
      setConversionProgress(pre);
    } else if (state.status === ConversionStatus.SUCCESS || state.status === ConversionStatus.PARTIAL_SUCCESS) {
      setConversionProgress(100);
    } else {
      setConversionProgress(0);
    }
  }, [state.status, state.matchingProgress]);

  // Trigger conversion when step changes to 'converting'
  useEffect(() => {
    if (conversionStep === 'converting' && state.selectedPlaylistId) {
      // Start the conversion process
      handleStartConversion();
    }
  }, [conversionStep, state.selectedPlaylistId, handleStartConversion]);

  // Save selected platforms to localStorage for conversion context
  useEffect(() => {
    if (selectedSourcePlatform && selectedDestinationPlatform) {
      localStorage.setItem('source_platform', selectedSourcePlatform);
      localStorage.setItem('destination_platform', selectedDestinationPlatform);
    }
  }, [selectedSourcePlatform, selectedDestinationPlatform]);
  
  return (
          <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-black dark:via-gray-900 dark:to-black">
      {/* Top Navigation Header */}
      <MobileHeader>
        <div className="flex items-center justify-between px-2">
          {/* Left Side - Branding */}
          <div className="flex items-center space-x-4">
            <div className="soundswapp-logo">
              <SoundSwappLogo width={40} height={40} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#FF7A59] via-[#FF007A] to-[#00C4CC] bg-clip-text text-transparent font-forma-djr">
                SoundSwapp
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-sf-pro-text">
                {activeTab === 'connections' ? 'Platform Connections' :
                 activeTab === 'converter' ? 'Convert Playlists' :
                 activeTab === 'history' ? 'Conversion History' :
                 'User Profile'}
              </p>
            </div>
          </div>
          {/* Right Side - Theme toggle + Profile avatar */}
          <div className="flex items-center space-x-3 pr-2">
            <motion.button 
              onClick={() => {
                toggleTheme();
                hapticLight();
              }}
              className={cn(
                "relative transition-all duration-300 rounded-full p-2",
                isDark 
                  ? "text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 hover:shadow-yellow-500/20 hover:shadow-lg" 
                  : "text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-100 hover:bg-gray-200/50 dark:hover:bg-gray-700/30"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              aria-label="Toggle theme"
            >
              <motion.div
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {isDark ? (
                  <Sun className="w-6 h-6 drop-shadow-sm" />
                ) : (
                  <Moon className="w-6 h-6 drop-shadow-sm" />
                )}
              </motion.div>
            </motion.button>

            {/* Profile avatar (replaces settings icon) */}
            <button
              onClick={() => setActiveTab('profile')}
              onContextMenu={(e) => { e.preventDefault(); navigate('/preferences'); }}
              className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out border bg-white focus:outline-none group"
              aria-label="Open profile"
            >
              {/* Enhanced animated ring border with SoundSwapp colors */}
              <motion.div
                className="absolute -inset-1 rounded-full"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: "conic-gradient(from 0deg, #FF7A59, #FF007A, #00C4CC, #FF7A59)",
                  mask: "radial-gradient(circle, transparent 55%, black 72%)",
                  WebkitMask: "radial-gradient(circle, transparent 55%, black 72%)"
                }}
              />
              
              {/* Secondary animated ring for depth */}
              <motion.div
                className="absolute -inset-1.5 rounded-full"
                animate={{
                  rotate: [360, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: "conic-gradient(from 180deg, #FF007A, #00C4CC, #FF7A59, #FF007A)",
                  mask: "radial-gradient(circle, transparent 70%, black 75%, black 90%, transparent 93%)",
                  WebkitMask: "radial-gradient(circle, transparent 70%, black 75%, black 90%, transparent 93%)"
                }}
              />
              
              {/* Halo effect around profile image */}
              <motion.div
                className="absolute -inset-2 rounded-full pointer-events-none opacity-60"
                style={{ background: "transparent" }}
                animate={{
                  boxShadow: [
                    "0 0 12px rgba(255, 122, 89, 0.4), 0 0 24px rgba(255, 0, 122, 0.3), 0 0 36px rgba(0, 196, 204, 0.2)",
                    "0 0 15px rgba(255, 0, 122, 0.4), 0 0 30px rgba(0, 196, 204, 0.3), 0 0 45px rgba(255, 209, 102, 0.2)",
                    "0 0 18px rgba(0, 196, 204, 0.4), 0 0 36px rgba(255, 209, 102, 0.3), 0 0 54px rgba(255, 122, 89, 0.2)",
                    "0 0 12px rgba(255, 122, 89, 0.4), 0 0 24px rgba(255, 0, 122, 0.3), 0 0 36px rgba(0, 196, 204, 0.2)"
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Profile image */}
              <div className="relative z-10 w-full h-full rounded-full overflow-hidden">
                <img
                  src={profileImage || user?.photoURL || "/images/default-avatar.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full select-none"
                  draggable={false}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src.endsWith('default-avatar.svg')) return;
                    img.src = "/images/default-avatar.svg";
                    setProfileImage("/images/default-avatar.svg");
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </MobileHeader>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            <motion.div
              className="h-full overflow-y-auto pb-[calc(5rem+env(safe-area-inset-bottom))] mobile-surface-premium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              {/* apply premium card style to existing sections without changing layout */}
              <div className="mx-4 mt-4 rounded-2xl p-4 shadow-lg mobile-card-premium animate-rise-fade">
                {renderContent()}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Fixed Bottom Navigation */}
      <div className="flex-shrink-0 z-10">

        
        <MobileBottomNav>
          {/* Left side nav items */}
          <div className="flex items-center justify-start space-x-2 sm:space-x-3 flex-1 min-w-0">
            <MobileNavItem
              icon={<LinkIcon className="w-6 h-6" />}
              label="Connect"
              active={activeTab === 'connections'}
              onClick={() => {
                setActiveTab('connections');
                hapticLight();
              }}
              badge={(!hasSpotifyAuth || !hasYouTubeAuth) ? '!' : undefined}
            />
            <MobileNavItem
              icon={<Music className="w-6 h-6" />}
              label="Convert"
              active={activeTab === 'converter'}
              onClick={() => {
                setActiveTab('converter');
                hapticLight();
              }}
              badge={state.conversionHistory && state.conversionHistory.length > 0 ? 
                state.conversionHistory.length.toString() : undefined}
            />
          </div>
          
          {/* AI Discovery Button - Center */}
          <div className="flex flex-col items-center justify-center gap-1 mx-2 sm:mx-4">
            <motion.button
              onClick={() => {
                setShowAIDiscovery(true);
                hapticLight();
              }}
              className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group focus:outline-none"
              aria-label="AI Discovery - Create personalized playlists with AI"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Clean animated gradient background */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  background: [
                    "linear-gradient(45deg, #FF7A59, #FF007A, #00C4CC, #FFD166)",
                    "linear-gradient(90deg, #FF007A, #00C4CC, #FFD166, #FF7A59)",
                    "linear-gradient(135deg, #00C4CC, #FFD166, #FF7A59, #FF007A)",
                    "linear-gradient(180deg, #FFD166, #FF7A59, #FF007A, #00C4CC)",
                    "linear-gradient(225deg, #FF7A59, #FF007A, #00C4CC, #FFD166)",
                    "linear-gradient(270deg, #FF007A, #00C4CC, #FFD166, #FF7A59)",
                    "linear-gradient(315deg, #00C4CC, #FFD166, #FF7A59, #FF007A)",
                    "linear-gradient(360deg, #FFD166, #FF7A59, #FF007A, #00C4CC)",
                    "linear-gradient(45deg, #FF7A59, #FF007A, #00C4CC, #FFD166)"
                  ]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Clean animated ring border */}
              <motion.div
                className="absolute -inset-1 rounded-full pointer-events-none"
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  background: "conic-gradient(from 0deg, #FF7A59, #FF007A, #00C4CC, #FF7A59)",
                  mask: "radial-gradient(circle, transparent 60%, black 70%)",
                  WebkitMask: "radial-gradient(circle, transparent 60%, black 70%)"
                }}
              />
              
              {/* Halo effect - outer glow */}
              <motion.div
                className="absolute -inset-2 rounded-full pointer-events-none opacity-80"
                animate={{
                  boxShadow: [
                    "0 0 15px rgba(255, 122, 89, 0.5), 0 0 30px rgba(255, 0, 122, 0.35), 0 0 45px rgba(0, 196, 204, 0.25)",
                    "0 0 18px rgba(255, 0, 122, 0.5), 0 0 36px rgba(0, 196, 204, 0.35), 0 0 54px rgba(255, 209, 102, 0.25)",
                    "0 0 20px rgba(0, 196, 204, 0.5), 0 0 40px rgba(255, 209, 102, 0.35), 0 0 60px rgba(255, 122, 89, 0.25)",
                    "0 0 15px rgba(255, 122, 89, 0.5), 0 0 30px rgba(255, 0, 122, 0.35), 0 0 45px rgba(0, 196, 204, 0.25)"
                  ]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Subtle inner glow */}
              <div
                className="absolute inset-1 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, transparent 100%)"
                }}
              />
              
              {/* Sparkles icon */}
              <div className="relative z-10">
                <Sparkles className="w-8 h-8 text-white drop-shadow-lg" />
              </div>
            </motion.button>
            
            {/* Subtle label */}
            <motion.div
              className="text-xs text-gray-500 dark:text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ y: 5, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
            >
              AI Discovery
            </motion.div>
            
            {/* Tooltip for better UX */}
            <motion.div
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300"
              initial={{ y: 10, opacity: 0 }}
              whileHover={{ y: 0, opacity: 1 }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span>Discover AI Playlists</span>
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </motion.div>
          </div>
          
          {/* Right side nav items */}
          <div className="flex items-center justify-end space-x-2 sm:space-x-3 flex-1 min-w-0">
            <MobileNavItem
              icon={<Clock className="w-6 h-6" />}
              label="History"
              active={activeTab === 'history'}
              onClick={() => {
                setActiveTab('history');
                hapticLight();
              }}
              badge={state.conversionHistory && state.conversionHistory.length > 0 ? 
                state.conversionHistory.length.toString() : undefined}
            />
            <MobileNavItem
              icon={<User className="w-6 h-6" />}
              label="Profile"
              active={activeTab === 'profile'}
              onClick={() => {
                setActiveTab('profile');
                hapticLight();
              }}
            />
          </div>
        </MobileBottomNav>
      </div>

      {/* AI Discovery Page */}
      {showAIDiscovery && (
        <AIDiscoveryPage
          onClose={() => setShowAIDiscovery(false)}
          onShowToast={showToast}
        />
      )}
    </div>
  );
});

export default MobileConverter;