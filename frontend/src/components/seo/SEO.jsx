// frontend/src/components/seo/SEO.jsx
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

/**
 * SEO Component - Manages document head for SEO
 * Automatically appends brand name to titles
 * Handles meta tags, Open Graph, and Twitter Cards
 */
export default function SEO({
  title,
  description,
  canonical,
  image,
  type = 'website',
  noindex = false,
  keywords,
}) {
  const siteName = 'Rizara Luxe';
  const domain = 'https://www.rizara.in';
  
  // Create full title with brand name
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  
  // Default image if none provided
  const ogImage = image || `${domain}/og/rizara-og-imagev2.jpg`;
  
  // Build canonical URL
  const canonicalUrl = canonical || domain;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      
      {description && (
        <meta name="description" content={description} />
      )}
      
      {keywords && (
        <meta name="keywords" content={keywords} />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots Meta */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      
      {description && (
        <meta property="og:description" content={description} />
      )}
      
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title || siteName} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      
      {description && (
        <meta name="twitter:description" content={description} />
      )}
      
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title || siteName} />

      {/* Additional Meta Tags */}
      <meta property="og:locale" content="en_IN" />
      <meta name="theme-color" content="#f7d4d9" />
    </Helmet>
  );
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  canonical: PropTypes.string,
  image: PropTypes.string,
  type: PropTypes.string,
  noindex: PropTypes.bool,
  keywords: PropTypes.string,
};