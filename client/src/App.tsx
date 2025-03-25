import { Route, Switch, Link } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NavBar from "./components/NavBar";
import { MobileNavBar } from "./components/MobileNavBar";
import ScrollToTop from "./components/ScrollToTop";
import { PageTransition } from "./components/PageTransition";
import { lazy, Suspense, useEffect } from "react";
import { initializeGlobalSecurity } from "./lib/security";
import { useConsoleProtection } from './hooks/useConsoleProtection';
import { setupDevToolsProtection } from './lib/devToolsProtection';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ColorSchemeProvider } from './contexts/ColorSchemeContext';
import Footer from './components/Footer'; // Added import for Footer component
import './lib/globalKeyboardGuard'; //Import global keyboard guard

// Lazy load page components for better performance and code splitting
const Home = lazy(() => import("./pages/Home"));
const AnimeDetails = lazy(() => import("./pages/AnimeDetails"));
const VideoPlayerPage = lazy(() => import("./pages/VideoPlayerPage"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const RecentlyWatched = lazy(() => import("./pages/RecentlyWatched"));
const GenrePage = lazy(() => import("./pages/GenrePage"));
const CategoryPage = lazy(() => import("./pages/CategoryPage"));
const TestPlayerPage = lazy(() => import("./pages/TestPlayerPage"));
const AdOptimizationTestPage = lazy(() => import("./pages/AdOptimizationTestPage"));

const NotFound = lazy(() => import("./pages/not-found"));

const queryClient = new QueryClient();

function App() {
  useConsoleProtection();
  
  // Enhanced security initialization
  useEffect(() => {
    // Initialize all security layers
    const securityLayers = [
      initializeGlobalKeyboardGuard(),       // Keyboard shortcut prevention
      setupDevToolsProtection(),             // General DevTools detection
    ];

    // Initialize Chromium-specific detection (with YouTube redirect)
    import('./lib/chromiumDetection').then(module => {
      const { setupChromiumDetection } = module;
      setupChromiumDetection(() => {
        // When DevTools detected in Chromium browsers, apply security measures
        try {
          // Clear sensitive content
          const elements = document.querySelectorAll('video, .video-container, .player-wrapper, .sensitive-data');
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.display = 'none';
            } else if (el instanceof HTMLVideoElement) {
              el.pause();
              el.src = '';
              el.load();
            }
          });

          // Add overlay with warning before redirect
          const overlay = document.createElement('div');
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
          overlay.style.color = 'red';
          overlay.style.fontSize = '24px';
          overlay.style.display = 'flex';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          overlay.style.zIndex = '999999';
          overlay.innerHTML = '<div>Security Alert: Developer Tools Detected<br>Access to content has been restricted</div>';
          document.body.appendChild(overlay);

          // Inform the server that DevTools are open
          try {
            axios.post('/api/security/devtools-detection', { 
              devToolsOpen: true,
              timestamp: Date.now(),
              token: localStorage.getItem('security_token') || ''
            });
          } catch (e) {
            // Silent fail
          }
          
          // After brief delay, redirect to YouTube
          setTimeout(() => {
            window.location.href = 'https://www.youtube.com';
          }, 2000);
        } catch (err) {
          // Silent fail to prevent debugging and redirect anyway
          window.location.href = 'https://www.youtube.com';
        }
      });
    }).catch(() => {});
    
    // Initialize global security measures
    initializeGlobalSecurity();

    // Import and set up Chromium-specific detection
    import('./lib/chromiumDetection').then(module => {
      const { setupChromiumDetection } = module;
      setupChromiumDetection(() => {
        // When devtools detected in Chromium browsers, block data
        try {
          // Notify server
          axios.post('/api/security/devtools-detection', { 
            devToolsOpen: true,
            browser: 'chromium',
            timestamp: Date.now(),
            token: localStorage.getItem('security_token') || ''
          }).catch(() => {});

          // Apply client-side protection measures
          const elements = document.querySelectorAll('video, .video-container, .player-wrapper');
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.display = 'none';
            } else if (el instanceof HTMLVideoElement) {
              el.pause();
              el.src = '';
              el.load();
            }
          });

          // Add overlay with warning
          const overlay = document.createElement('div');
          overlay.style.position = 'fixed';
          overlay.style.top = '0';
          overlay.style.left = '0';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
          overlay.style.color = 'red';
          overlay.style.fontSize = '24px';
          overlay.style.display = 'flex';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          overlay.style.zIndex = '999999';
          overlay.innerHTML = '<div>Security Alert: Developer Tools Detected<br>Access to content has been restricted</div>';
          document.body.appendChild(overlay);

          // Also inform the server that DevTools are open
          try {
            axios.post('/api/security/devtools-detection', { 
              devToolsOpen: true,
              timestamp: Date.now(),
              token: localStorage.getItem('security_token') || ''
            });
          } catch (e) {
            // Silent fail
          }
        } catch (err) {
          // Silent fail to prevent debugging
        }
      });
    }).catch(() => {});
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ColorSchemeProvider>
          <div className="min-h-screen flex flex-col bg-gradient-to-b from-black via-dark-950 to-dark-900 text-slate-50 font-sans">
            <NavBar />
            <main className="flex-grow relative">
              <Suspense fallback={
              <div className="w-full h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-10 w-10 rounded-full bg-primary/60 mb-4"></div>
                  <div className="h-2 w-24 bg-primary/40 rounded"></div>
                </div>
              </div>
            }>
              <PageTransition>
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/anime/:id" component={AnimeDetails} />
                  <Route path="/watch/:animeId/:episodeId" component={VideoPlayerPage} />
                  <Route path="/search" component={SearchResults} />
                  <Route path="/recently-watched" component={RecentlyWatched} />
                  <Route path="/genre/:genre" component={GenrePage} />
                  <Route path="/category/:type" component={CategoryPage} />
                  <Route path="/test-player" component={TestPlayerPage} />
                  {/* Commented out route with invalid component */}
                  {/* <Route path="/ad-optimization" component={AdOptimizationTestPage} /> */}
                  <Route component={NotFound} />
                </Switch>
              </PageTransition>
            </Suspense>
          </main>
          <MobileNavBar />
          <ScrollToTop />
          <Toaster />
          <Footer /> {/* Added Footer component */}
        </div>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;