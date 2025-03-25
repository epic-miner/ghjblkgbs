import { Helmet } from 'react-helmet-async';

const DefaultSeo = () => {
  // Default website structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "9Anime",
    "url": "https://9anime.fun",
    "description": "Watch free anime online in HD quality with English subtitles on 9Anime.fun. The largest collection of high-quality anime episodes with fast streaming.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://9anime.fun/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Organization structured data for branding
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "9Anime",
    "url": "https://9anime.fun",
    "logo": "https://9anime.fun/logo.png",
    "sameAs": [
      "https://twitter.com/9anime",
      "https://facebook.com/9anime"
    ]
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
      
      {/* Canonical URL */}
      <link rel="canonical" href="https://9anime.fun" />
    </Helmet>
  );
};

export default DefaultSeo;