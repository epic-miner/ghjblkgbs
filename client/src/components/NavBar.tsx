import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link, useLocation } from 'wouter';
import SearchBar from './SearchBar';
import { Search, X, Home, BookOpen, History, MessageCircle, Menu, Video, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

// Memoized NavLink component to prevent unnecessary renders
interface NavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isMobile?: boolean;
}

const NavLink = memo(({ href, icon, label, isActive, isMobile = false }: NavLinkProps) => {
  // Memoize class names to avoid recalculations
  const className = useMemo(() => 
    cn(
      "flex items-center gap-2 transition-all duration-200",
      isActive 
        ? "text-white font-medium" 
        : "text-slate-300 hover:text-white",
      isMobile && "py-2",
      !isMobile && "hover:scale-105",
      "text-xs sm:text-base flex items-center gap-1.5" // Added flex layout and gap for icons
    ),
    [isActive, isMobile]
  );

  const iconStyle = useMemo(() => 
    cn(
      "transition-colors duration-200",
      isActive ? "text-primary" : "text-slate-400 group-hover:text-primary",
      isMobile ? "mr-1" : "mr-2"
    ),
    [isActive, isMobile]
  );

  return (
    href.startsWith('https://t.me') ? (
          <a href={href} target="_blank" rel="noopener noreferrer">
            <div className={`${className} group`}>
              <span className={iconStyle}>{icon}</span>
              <span>{label}</span>
            </div>
          </a>
        ) : (
          <Link href={href}>
            <div className={`${className} group`}>
              <span className={iconStyle}>{icon}</span>
              <span>{label}</span>
            </div>
          </Link>
        )
  );
});

NavLink.displayName = 'NavLink';

// MobileSearchOverlay component
const MobileSearchOverlay = memo(({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  // Memoize overlay classes to prevent recreation on each render
  const overlayClasses = useMemo(() => 
    cn(
      "fixed inset-0 bg-gradient-to-b from-black/95 to-dark-900/95 backdrop-blur-xl z-50 transition-all duration-300 will-change-transform",
      "md:hidden flex flex-col",
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    ),
    [isOpen]
  );

  return (
    <div className={overlayClasses}>
      <div className="sticky top-0 border-b border-dark-800/30 bg-gradient-to-b from-black/80 to-dark-900/70 backdrop-blur-xl shadow-md">
        <div className="container mx-auto px-4 h-16 flex items-center gap-3">
          <div className="flex-1">
            <SearchBar autoFocus />
          </div>
          <button
            className="p-2 text-white hover:text-primary transition-colors rounded-full hover:bg-dark-800/50"
            onClick={onClose}
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

MobileSearchOverlay.displayName = 'MobileSearchOverlay';

// Main NavBar component
const NavBar = memo(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  // Memoize toggle handlers to prevent recreating functions on each render
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
    setSearchOverlayOpen(false);
  }, []);

  const toggleSearchOverlay = useCallback(() => {
    setSearchOverlayOpen(prev => !prev);
    setMobileMenuOpen(false);
  }, []);

  // Close mobile menu and search overlay on location change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOverlayOpen(false);
  }, [location]);

  // Optimize scroll handler with passive listener for better performance
  useEffect(() => {
    const handleScroll = () => {
      const shouldBeScrolled = window.scrollY > 20;
      // Only update state if the value has changed
      if (scrolled !== shouldBeScrolled) {
        setScrolled(shouldBeScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Memoize whether links are active based on location
  const isHomeActive = useMemo(() => location === '/', [location]);
  const isGenreActive = useMemo(() => location.startsWith('/genre'), [location]);
  const isRecentlyWatchedActive = useMemo(() => location === '/recently-watched', [location]);

  // Memoize header class names
  const headerClasses = useMemo(() => 
    cn(
      "bg-gradient-to-b from-black/90 to-dark-900/95 backdrop-blur-xl sticky top-0 z-50 will-change-transform shadow-lg",
      scrolled ? 'shadow-md border-b border-dark-700/20' : 'border-b border-dark-800/30'
    ),
    [scrolled]
  );

  // Memoize mobile menu classes
  const mobileMenuClasses = useMemo(() => 
    cn(
      "md:hidden overflow-hidden transition-all duration-300 ease-in-out will-change-height",
      "bg-gradient-to-b from-dark-900/90 to-black/80 backdrop-blur-md",
      mobileMenuOpen ? "max-h-60 py-4 border-t border-dark-800/30 shadow-inner" : "max-h-0"
    ),
    [mobileMenuOpen]
  );

  const navigation = useMemo(() => [
    { href: '/', icon: <Home className="w-5 h-5" />, label: 'Home' },
    { href: '/genre/all', icon: <BookOpen className="w-5 h-5" />, label: 'Genres' },
    { href: '/recently-watched', icon: <History className="w-5 h-5" />, label: 'Recently Watched' },
    { href: 'https://discord.gg/q9D44eGeES', icon: <MessageCircle className="w-5 h-5" />, label: 'Contact' },
  ], []);

  return (
    <>
      <header className={headerClasses}>
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14">
            {/* Logo - Optimized for performance with responsive images */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="relative flex items-center gap-2">
                <picture>
                  {/* WebP format for modern browsers */}
                  <source srcSet="/images/logo.webp" type="image/webp" />
                  {/* PNG format fallback with responsive sizes */}
                  <source srcSet="/images/icons/logo-64x64.png" media="(max-width: 768px)" />
                  <source srcSet="/images/logo.png" media="(min-width: 769px)" />
                  {/* Fallback image with optimized loading attributes */}
                  <img 
                    src="/images/logo.png" 
                    alt="9Anime Logo" 
                    className="h-8 w-8"
                    width="32"
                    height="32"
                    loading="eager"
                    decoding="async"
                  />
                </picture>
                <span className="text-base sm:text-xl font-bold">
                  <span className="text-primary">9</span>
                  <span className="bg-gradient-to-r from-primary to-purple-500 text-transparent bg-clip-text">Anime</span>
                </span>
                <div className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="hidden md:block flex-grow max-w-2xl mx-8">
              <SearchBar />
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Mobile Search Toggle */}
              <button
                className="md:hidden p-2 text-white hover:text-primary transition-colors rounded-full hover:bg-dark-800/50"
                onClick={toggleSearchOverlay}
                aria-label="Toggle search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-10">
                {navigation.map((item) => (
                  <NavLink 
                    key={item.href}
                    href={item.href} 
                    icon={item.icon} 
                    label={item.label} 
                    isActive={item.href === location}
                  />
                ))}
              </nav>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-white hover:text-primary transition-colors rounded-full hover:bg-dark-800/50"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={mobileMenuClasses}>
            <nav className="flex flex-col space-y-4 px-3">
              {navigation.map((item) => (
                <NavLink 
                  key={item.href}
                  href={item.href} 
                  icon={item.icon} 
                  label={item.label} 
                  isActive={item.href === location}
                  isMobile
                />
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay 
        isOpen={searchOverlayOpen} 
        onClose={toggleSearchOverlay} 
      />
    </>
  );
});

NavBar.displayName = 'NavBar';

export default NavBar;