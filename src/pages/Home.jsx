import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import BlogCard from '../components/BlogCard';
import Seo from '../components/Seo';
import useRemoteData from '../hooks/useRemoteData';
import {
  fetchPublishedProducts,
  fetchPublishedBlogPosts,
  fetchPublishedCollections,
  fetchPublishedCategories,
  fetchPublishedHomepageSections,
  DEFAULT_HOMEPAGE_SECTIONS,
} from '../lib/content';
import {
  products as fallbackProducts,
  blogPosts as fallbackBlogPosts,
  collections as fallbackCollections,
} from '../data/products';

export default function Home() {
  const [products] = useRemoteData(fetchPublishedProducts, fallbackProducts);
  const [blogPosts] = useRemoteData(fetchPublishedBlogPosts, fallbackBlogPosts);
  const [collections] = useRemoteData(fetchPublishedCollections, fallbackCollections);
  const [categories] = useRemoteData(fetchPublishedCategories, []);
  const [homepageSections] = useRemoteData(
    fetchPublishedHomepageSections,
    DEFAULT_HOMEPAGE_SECTIONS
  );

  const categoryImages = {
    fashion:
      'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=800&q=80',
    jewellery:
      'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80',
    'hair-care':
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    'skin-care':
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
  };

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lavs Studio',
    url: 'https://www.lavsstudio.com/',
    description:
      'Discover Amazon Finds, affordable fashion, college girl fashion, hair care, skincare, jewellery and Pinterest-worthy inspiration at Lavs Studio.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.lavsstudio.com/categories',
      'query-input': 'required name=search_term_string',
    },
  };

  // Render individual homepage section based on type
  const renderSection = (sec) => {
    const config = sec.configuration_data || {};

    switch (sec.section_type) {
      case 'hero':
        return (
          <section
            key={sec.id || 'hero'}
            className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20"
          >
            <div className="flex flex-col justify-center space-y-6">
              {sec.subtitle && (
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">
                  {sec.subtitle}
                </p>
              )}
              <h1 className="font-display text-4xl font-bold leading-tight text-[#2e1f3b] sm:text-5xl lg:text-6xl">
                {sec.section_title}
              </h1>
              {config.description && (
                <p className="max-w-xl text-lg text-[#2e1f3b]/75 leading-relaxed">
                  {config.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 pt-2">
                {config.btn_primary_text && (
                  <Link
                    to={config.btn_primary_url || '/amazon-finds'}
                    className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#f472b6]/25 transition-all hover:opacity-95"
                  >
                    {config.btn_primary_text}
                  </Link>
                )}
                {config.btn_secondary_text && (
                  <Link
                    to={config.btn_secondary_url || '/categories'}
                    className="rounded-full border border-[#e9d5ff] bg-white/80 px-6 py-3.5 text-sm font-semibold text-[#2e1f3b] shadow-sm transition hover:border-[#f472b6] hover:bg-[#fde8f3]/60"
                  >
                    {config.btn_secondary_text}
                  </Link>
                )}
              </div>
            </div>
            <div className="overflow-hidden rounded-[36px] border border-[#e9d5ff]/80 bg-white/90 p-4 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
              <img
                src={
                  config.hero_image ||
                  'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80'
                }
                alt="Editorial lifestyle and fashion inspiration for Lavs Studio"
                className="h-[460px] w-full rounded-[28px] object-cover"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="https://in.pinterest.com/lavsstudio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-95"
                >
                  Follow on Pinterest
                </a>
                <a
                  href="https://in.pinterest.com/lavsstudio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#e9d5ff] bg-white/80 px-4 py-2 text-xs text-[#2e1f3b]/80 transition hover:bg-[#fde8f3]/60 hover:text-[#2e1f3b]"
                >
                  Explore Boards
                </a>
              </div>
            </div>
          </section>
        );

      case 'categories':
        return (
          <section key={sec.id || 'categories'} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow={sec.subtitle || 'Trending categories'}
              title={sec.section_title || 'Shop by mood, look, and self-care ritual'}
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {categories.map((category) => (
                <Link
                  key={category.id || category.name}
                  to={category.to || `/${category.slug}`}
                  className="group overflow-hidden rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 backdrop-blur-xl shadow-xl shadow-purple-950/5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f472b6]/60 hover:shadow-purple-950/10"
                >
                  <div className="h-48 w-full overflow-hidden bg-[#f3e8ff]/50">
                    <img
                      src={
                        category.image ||
                        categoryImages[category.slug] ||
                        categoryImages[category.name?.toLowerCase()?.replace(/\s+/g, '-')] ||
                        'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={`${category.name} category on Lavs Studio`}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-[#2e1f3b]">{category.name}</h3>
                    <p className="mt-2 text-sm text-[#2e1f3b]/75">
                      A refined edit for your daily favourites.
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );

      case 'featured_products': {
        const limit = config.limit || 6;
        return (
          <section key={sec.id || 'featured'} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow={sec.subtitle || 'Featured Amazon finds'}
              title={sec.section_title || 'A polished edit of everyday essentials'}
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.slice(0, limit).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        );
      }

      case 'blog': {
        const limit = config.limit || 3;
        return (
          <section key={sec.id || 'blog'} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow={sec.subtitle || 'Latest blog posts'}
              title={sec.section_title || 'Style notes and beauty inspiration'}
            />
            <div className="grid gap-6 md:grid-cols-3">
              {blogPosts.slice(0, limit).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        );
      }

      case 'collections':
        return (
          <section key={sec.id || 'collections'} className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow={sec.subtitle || 'Popular collections'}
              title={sec.section_title || 'Curations made for your Pinterest mood board'}
            />
            <div className="grid gap-6 md:grid-cols-3">
              {collections.map((collection) => (
                <div
                  key={collection.title}
                  className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-8 backdrop-blur-xl shadow-xl shadow-purple-950/5 transition duration-300 hover:border-[#f472b6]/60"
                >
                  <h3 className="text-2xl font-bold text-[#2e1f3b]">{collection.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#2e1f3b]/75">{collection.text}</p>
                </div>
              ))}
            </div>
          </section>
        );

      case 'newsletter':
        return (
          <section key={sec.id || 'newsletter'} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="rounded-[32px] border border-[#e9d5ff]/80 bg-white/90 p-8 text-center backdrop-blur-xl shadow-xl shadow-purple-950/5 sm:p-12">
              {sec.subtitle && (
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">
                  {sec.subtitle}
                </p>
              )}
              <h2 className="mt-3 text-3xl font-bold text-[#2e1f3b] sm:text-4xl">{sec.section_title}</h2>
              {config.description && (
                <p className="mx-auto mt-3 max-w-2xl text-[#2e1f3b]/75">
                  {config.description}
                </p>
              )}
              <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  className="flex-1 rounded-full border border-[#e9d5ff] bg-white/80 px-5 py-3.5 text-sm text-[#2e1f3b] placeholder-[#2e1f3b]/40 outline-none focus:border-[#ec4899]"
                  placeholder={config.placeholder || 'Email address'}
                />
                <button className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-6 py-3.5 text-sm font-semibold text-white transition hover:opacity-95 shadow-md shadow-[#f472b6]/20">
                  {config.button_text || 'Subscribe'}
                </button>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <Layout>
      <Seo
        title="Amazon Finds, Affordable Fashion & Beauty"
        description="Explore Amazon Finds, affordable fashion, college girl fashion, hair care, skincare, jewellery and Pinterest-inspired recommendations by Lavs Studio."
        schema={schema}
      />
      {homepageSections.map((sec) => renderSection(sec))}
    </Layout>
  );
}


