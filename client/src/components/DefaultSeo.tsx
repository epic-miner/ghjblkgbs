import { Helmet } from 'react-helmet-async';

const DefaultSeo = () => {
  // Enhanced website structured data with better discoverability
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "9Anime",
    "url": "https://9anime.fun",
    "description": "Watch free anime online in HD quality with English subtitles on 9Anime.fun. The largest collection of high-quality anime episodes with fast streaming.",
    "alternateName": "9anime.fun",
    "creator": {
      "@type": "Organization",
      "name": "9Anime"
    },
    "inLanguage": "en-US",
    "copyrightYear": new Date().getFullYear(),
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://9anime.fun/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "ViewAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://9anime.fun/anime/{anime_id}"
        }
      }
    ]
  };

  // Enhanced organization structured data for better branding
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "9Anime",
    "url": "https://9anime.fun",
    "logo": "https://9anime.fun/logo.png",
    "sameAs": [
      "https://twitter.com/9anime",
      "https://facebook.com/9anime"
    ],
    "description": "9Anime is a free anime streaming platform offering high-quality content with fast servers and a user-friendly interface.",
    "email": "support@9anime.fun",
    "foundingDate": "2023-01-01",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@9anime.fun",
      "availableLanguage": ["English", "Japanese"]
    }
  };
  
  // Video site-specific structured data
  const videoContentData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": "https://9anime.fun",
    "name": "9Anime - Free Anime Streaming Site",
    "description": "Stream and watch anime for free in HD quality with English subtitles. Find popular, trending, and latest anime releases all in one place.",
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://9anime.fun/logo.png"
    },
    "about": {
      "@type": "Thing",
      "name": "Anime Streaming",
      "description": "High-quality anime streaming service with a large collection of titles across various genres."
    },
    "specialty": "Anime streaming in HD quality",
    "mainContentOfPage": {
      "@type": "WebPageElement",
      "cssSelector": "#root"
    }
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>9Anime - Watch Anime Online Free in HD Quality</title>
      <meta name="description" content="Watch anime online for free in HD quality with English subtitles on 9Anime.fun. Stream and download your favorite anime series and movies." />
      <meta name="keywords" content="9anime, anime streaming, watch anime online, free anime, anime download, anime episodes, anime series, anime movies" />
      
      {/* Language and Geo Tags */}
      <meta name="language" content="English" />
      <meta name="robots" content="index, follow" />
      <meta name="revisit-after" content="1 days" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content="9Anime - Watch Anime Online Free in HD Quality" />
      <meta property="og:description" content="Watch anime online for free in HD quality with English subtitles on 9Anime.fun. Stream and download your favorite anime series and movies." />
      <meta property="og:image" content="https://9anime.fun/logo.png" />
      <meta property="og:url" content="https://9anime.fun" />
      <meta property="og:site_name" content="9Anime" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="9Anime - Watch Anime Online Free in HD Quality" />
      <meta name="twitter:description" content="Watch anime online for free in HD quality with English subtitles on 9Anime.fun. Stream and download your favorite anime series and movies." />
      <meta name="twitter:image" content="https://9anime.fun/logo.png" />
      
      {/* Structured Data - Website */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Structured Data - Organization */}
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
      
      {/* Structured Data - Video Content Site */}
      <script type="application/ld+json">
        {JSON.stringify(videoContentData)}
      </script>
      
      {/* Canonical URL */}
      <link rel="canonical" href="https://9anime.fun" />
      
      {/* Mobile-friendly Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#1D4ED8" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    </Helmet>
  );
};

export default DefaultSeo;