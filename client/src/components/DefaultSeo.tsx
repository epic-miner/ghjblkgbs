import { Helmet } from 'react-helmet-async';

const DefaultSeo = () => {
  const currentYear = new Date().getFullYear();
  
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
    "copyrightYear": currentYear,
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
    ],
    "keywords": "anime, anime streaming, watch anime online, free anime, anime download, anime episodes, anime series, anime movies, 9anime",
    "audience": {
      "@type": "Audience",
      "audienceType": "Anime Fans",
      "geographicArea": {
        "@type": "AdministrativeArea",
        "name": "Worldwide"
      }
    }
  };

  // Enhanced organization structured data for better branding
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "9Anime",
    "url": "https://9anime.fun",
    "logo": {
      "@type": "ImageObject",
      "url": "https://9anime.fun/logo.png",
      "width": "512",
      "height": "512"
    },
    "sameAs": [
      "https://twitter.com/9anime",
      "https://facebook.com/9anime",
      "https://instagram.com/9anime.official",
      "https://discord.gg/9anime"
    ],
    "description": "9Anime is a free anime streaming platform offering high-quality content with fast servers and a user-friendly interface.",
    "email": "support@9anime.fun",
    "foundingDate": "2023-01-01",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@9anime.fun",
      "availableLanguage": ["English", "Japanese", "Spanish", "French", "German"]
    },
    "knowsAbout": ["Anime", "Manga", "Japanese Animation", "Streaming Media"],
    "slogan": "Your ultimate anime streaming destination",
    "areaServed": "Worldwide",
    "award": "Best Anime Streaming Site 2023"
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
      "url": "https://9anime.fun/logo.png",
      "width": "512",
      "height": "512"
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
    },
    "significantLink": [
      {
        "@type": "WebPage",
        "url": "https://9anime.fun/category/trending",
        "name": "Trending Anime"
      },
      {
        "@type": "WebPage",
        "url": "https://9anime.fun/category/recent",
        "name": "Latest Releases"
      },
      {
        "@type": "WebPage",
        "url": "https://9anime.fun/category/popular",
        "name": "Popular Anime"
      }
    ],
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://9anime.fun"
        }
      ]
    },
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", ".description", ".headline"]
    }
  };

  // Build a FAQPage structured data for common anime streaming questions
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is 9Anime free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, 9Anime is completely free to use. You can watch anime series and movies in HD quality without any subscription fees."
        }
      },
      {
        "@type": "Question",
        "name": "Does 9Anime have English subtitles?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, 9Anime provides English subtitles for all anime content. Some popular titles also offer subtitles in multiple languages."
        }
      },
      {
        "@type": "Question",
        "name": "How often is new content added to 9Anime?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "9Anime updates its library daily with the latest anime episodes, typically within hours of their original Japanese broadcast."
        }
      },
      {
        "@type": "Question",
        "name": "Can I download anime from 9Anime?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "9Anime primarily focuses on streaming, but some content may be available for download to watch offline depending on your region and device capabilities."
        }
      },
      {
        "@type": "Question",
        "name": "Is 9Anime available on mobile devices?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, 9Anime is fully responsive and works on all modern mobile devices. You can also install it as a Progressive Web App for an app-like experience."
        }
      }
    ]
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>9Anime - Watch Anime Online Free in HD Quality</title>
      <meta name="description" content="Watch anime online for free in HD quality with English subtitles on 9Anime.fun. Stream and download your favorite anime series and movies." />
      <meta name="keywords" content="9anime, anime streaming, watch anime online, free anime, anime download, anime episodes, anime series, anime movies, dubbed anime, subbed anime" />
      
      {/* Language and Geo Tags */}
      <meta name="language" content="English" />
      <meta httpEquiv="content-language" content="en" />
      <meta name="geo.region" content="US" />
      <meta name="geo.position" content="37.09024;-95.712891" />
      <meta name="ICBM" content="37.09024, -95.712891" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="revisit-after" content="1 days" />
      <meta name="author" content="9Anime" />
      <meta name="copyright" content={`Copyright © ${currentYear} 9Anime`} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content="9Anime - Watch Anime Online Free in HD Quality" />
      <meta property="og:description" content="Watch anime online for free in HD quality with English subtitles on 9Anime.fun. Stream and download your favorite anime series and movies." />
      <meta property="og:image" content="https://9anime.fun/logo.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="9Anime Logo" />
      <meta property="og:url" content="https://9anime.fun" />
      <meta property="og:site_name" content="9Anime" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="ja_JP" />
      <meta property="og:video" content="https://9anime.fun/promo.mp4" />
      <meta property="og:video:type" content="video/mp4" />
      <meta property="og:video:width" content="1280" />
      <meta property="og:video:height" content="720" />
      <meta property="fb:app_id" content="123456789012345" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@9anime" />
      <meta name="twitter:creator" content="@9anime" />
      <meta name="twitter:title" content="9Anime - Watch Anime Online Free in HD Quality" />
      <meta name="twitter:description" content="Watch anime online for free in HD quality with English subtitles on 9Anime.fun. Stream and download your favorite anime series and movies." />
      <meta name="twitter:image" content="https://9anime.fun/logo.png" />
      <meta name="twitter:image:alt" content="9Anime Logo" />
      <meta name="twitter:dnt" content="on" />
      
      {/* App tags */}
      <meta name="application-name" content="9Anime" />
      <meta name="apple-itunes-app" content="app-id=123456789, app-argument=https://9anime.fun" />
      <meta name="msapplication-TileColor" content="#1D4ED8" />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
      
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
      
      {/* Structured Data - FAQ */}
      <script type="application/ld+json">
        {JSON.stringify(faqData)}
      </script>
      
      {/* Canonical URL */}
      <link rel="canonical" href="https://9anime.fun" />
      
      {/* Alternate language versions */}
      <link rel="alternate" href="https://9anime.fun" hrefLang="x-default" />
      <link rel="alternate" href="https://9anime.fun" hrefLang="en" />
      <link rel="alternate" href="https://ja.9anime.fun" hrefLang="ja" />
      <link rel="alternate" href="https://es.9anime.fun" hrefLang="es" />
      
      {/* Favicons and App Icons */}
      <link rel="icon" type="image/png" sizes="16x16" href="/images/icons/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/images/icons/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/images/icons/apple-touch-icon.png" />
      <link rel="mask-icon" href="/images/icons/safari-pinned-tab.svg" color="#1D4ED8" />
      
      {/* Mobile-friendly Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#1D4ED8" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="9Anime" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Web manifest */}
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* DNS Prefetch and Preconnect for performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//cdn.9anime.fun" />
      <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.9anime.fun" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default DefaultSeo;