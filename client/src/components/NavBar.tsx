import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link, useLocation } from 'wouter';
import SearchBar from './SearchBar';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Memoized NavLink component to prevent unnecessary renders
interface NavLinkProps {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
  isMobile?: boolean;
}

const NavLink = memo(({ href, icon, label, isActive, isMobile = false }: NavLinkProps) => {
  // Memoize class names to avoid recalculations
  const className = useMemo(() => 
    cn(
      "flex items-center gap-2",
      isActive ? "text-white font-medium" : "text-slate-300 hover:text-white",
      isMobile && "py-2"
    ),
    [isActive, isMobile]
  );

  const iconClass = useMemo(() => 
    cn(
      `fas fa-${icon} text-sm text-primary`,
      isMobile ? "mr-3" : "mr-2"
    ),
    [icon, isMobile]
  );

  return (
    <Link href={href}>
      <div className={className}>
        <i className={iconClass}></i>
        <span>{label}</span>
      </div>
    </Link>
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
      "fixed inset-0 bg-background/95 backdrop-blur-lg z-50 transition-all duration-300 will-change-transform",
      "md:hidden flex flex-col",
      isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    ),
    [isOpen]
  );
  
  return (
    <div className={overlayClasses}>
      <div className="sticky top-0 border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
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
      "bg-dark-900/95 backdrop-blur-md sticky top-0 z-50 will-change-transform",
      scrolled ? 'shadow-md' : 'border-b border-dark-800/60'
    ),
    [scrolled]
  );

  // Memoize mobile menu classes
  const mobileMenuClasses = useMemo(() => 
    cn(
      "md:hidden overflow-hidden transition-all duration-300 ease-in-out will-change-height",
      mobileMenuOpen ? "max-h-48 py-3" : "max-h-0"
    ),
    [mobileMenuOpen]
  );

  return (
    <>
      <header className={headerClasses}>
        <div className="container mx-auto px-4">
          <div className="flex items-center h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="relative flex items-center gap-2">
                <img 
                  src="/images/logo.png" 
                  alt="9Anime Logo" 
                  className="h-8 w-8"
                  width="32"
                  height="32"
                  loading="eager"
                />
                <span className="text-xl md:text-2xl font-bold">
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
              <nav className="hidden md:flex items-center space-x-8">
                <NavLink 
                  href="/" 
                  icon="home" 
                  label="Home" 
                  isActive={isHomeActive} 
                />
                <NavLink 
                  href="/genre/all" 
                  icon="tags" 
                  label="Genres" 
                  isActive={isGenreActive} 
                />
                <NavLink 
                  href="/recently-watched" 
                  icon="history" 
                  label="Recently Watched" 
                  isActive={isRecentlyWatchedActive} 
                />
              </nav>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-white hover:text-primary transition-colors rounded-full hover:bg-dark-800/50"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={mobileMenuClasses}>
            <nav className="flex flex-col space-y-3">
              <NavLink 
                href="/" 
                icon="home" 
                label="Home" 
                isActive={isHomeActive} 
                isMobile 
              />
              <NavLink 
                href="/genre/all" 
                icon="tags" 
                label="Genres" 
                isActive={isGenreActive} 
                isMobile 
              />
              <NavLink 
                href="/recently-watched" 
                icon="history" 
                label="Recently Watched" 
                isActive={isRecentlyWatchedActive} 
                isMobile 
              />
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