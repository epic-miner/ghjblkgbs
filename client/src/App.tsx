import { Route, Switch, Link } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NavBar from "./components/NavBar";
import { MobileNavBar } from "./components/MobileNavBar";
import ScrollToTop from "./components/ScrollToTop";
import { PageTransition } from "./components/PageTransition";
import { lazy, Suspense, useEffect } from "react";
import { initializeGlobalSecurity } from "./lib/security";
import { useConsoleProtection } from './hooks/useConsoleProtection';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ColorSchemeProvider } from './contexts/ColorSchemeContext';
import Footer from './components/Footer'; // Added import for Footer component

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
  // Initialize global security measures
  useEffect(() => {
    initializeGlobalSecurity();
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