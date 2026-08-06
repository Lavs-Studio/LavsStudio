import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const siteUrl = 'https://www.lavsstudio.com';
const defaultTitle = 'Lavs Studio | Amazon Finds, Affordable Fashion & Beauty';
const defaultDescription = 'Discover Amazon Finds, affordable fashion, college girl fashion, hair care, skincare, jewellery and Pinterest-worthy inspiration at Lavs Studio.';
const defaultImage = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80';
const pinterestImage = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80';
const defaultKeywords = 'Amazon Finds, Affordable Fashion, College Girl Fashion, Hair Care, Skincare, Jewellery, Pinterest Finds';

function getCanonicalUrl(pathname) {
  return `${siteUrl}${pathname}`;
}

function setMetaTag(name, value, attr = 'name') {
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
}

function setLinkRel(rel, href) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

export default function Seo({ title, description, image = defaultImage, keywords = defaultKeywords, type = 'website', schema }) {
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    const pageTitle = title ? `${title} | Lavs Studio` : defaultTitle;
    const pageDescription = description || defaultDescription;
    const canonicalUrl = getCanonicalUrl(pathname);

    document.title = pageTitle;
    setMetaTag('description', pageDescription);
    setMetaTag('keywords', keywords);
    setMetaTag('robots', 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    setMetaTag('theme-color', '#fffdfb');
    setMetaTag('og:title', pageTitle, 'property');
    setMetaTag('og:description', pageDescription, 'property');
    setMetaTag('og:type', type, 'property');
    setMetaTag('og:url', canonicalUrl, 'property');
    setMetaTag('og:image', image, 'property');
    setMetaTag('twitter:card', 'summary_large_image', 'name');
    setMetaTag('twitter:title', pageTitle, 'name');
    setMetaTag('twitter:description', pageDescription, 'name');
    setMetaTag('twitter:image', image, 'name');
    setMetaTag('p:domain_verify', 'lavsstudio', 'name');
    setMetaTag('og:image:width', '1200', 'property');
    setMetaTag('og:image:height', '1500', 'property');
    setMetaTag('article:publisher', 'https://www.pinterest.com/', 'property');
    setMetaTag('pinterest-rich-pin', 'true', 'name');
    setLinkRel('canonical', canonicalUrl);

    let scriptTag = document.querySelector('script[data-seo-jsonld]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('data-seo-jsonld', 'true');
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    if (schema) {
      scriptTag.textContent = JSON.stringify(schema);
    } else {
      scriptTag.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Lavs Studio',
        url: canonicalUrl,
      });
    }
  }, [title, description, image, keywords, pathname, schema, type]);

  return null;
}
