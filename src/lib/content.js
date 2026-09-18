import { blogPosts as fallbackBlogPosts, categories as fallbackBlogCategories } from '../blog/posts';
import { collections as fallbackCollections, products as fallbackProducts } from '../data/products';
import { supabase, isSupabaseConfigured } from './supabase';

export const fallbackSiteSettings = {
  brandName: 'Lavs Studio',
  navDisclosure:
    'Disclosure: Lavs Studio may earn a commission from qualifying Amazon purchases. Prices and availability are subject to change.',
  footerDescription: 'Curated fashion, beauty, and lifestyle picks for a soft, elevated life.',
  footerDisclaimer: 'Amazon disclaimer: affiliate links and recommendations support Lavs Studio.',
};

export const defaultPageCopy = {
  about: {
    title: 'About Lavs Studio',
    description:
      'Lavs Studio is a feminine lifestyle destination built around thoughtfully curated fashion, beauty, and everyday indulgences.',
    body: 'Every recommendation is designed to feel polished, attainable, and worthy of a second look.',
  },
  contact: {
    title: 'Contact',
    description: 'Reach out for collaborations, brand inquiries, or general questions.',
    body: '',
  },
  privacy: {
    title: 'Privacy Policy',
    description: 'This page outlines how user information may be collected, used, and protected on Lavs Studio.',
    body: '',
  },
  affiliateDisclosure: {
    title: 'Affiliate Disclosure',
    description: 'Learn how Lavs Studio may earn commissions through Amazon affiliate links and recommendations.',
    body: 'Lavs Studio participates in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees.',
  },
};

export const DEFAULT_HOMEPAGE_SECTIONS = [
  {
    id: 'sec-hero',
    section_type: 'hero',
    section_title: 'Discover elevated essentials for beauty, fashion, and everyday luxury.',
    subtitle: 'Curated for your soft glow',
    display_order: 0,
    active: true,
    configuration_data: {
      description: 'Lavs Studio brings together timeless favourites, Pinterest-worthy finds, and thoughtful recommendations in one calm, premium space.',
      hero_image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
      btn_primary_text: 'Explore Amazon Finds',
      btn_primary_url: '/amazon-finds',
      btn_secondary_text: 'Browse Categories',
      btn_secondary_url: '/categories',
    },
  },
  {
    id: 'sec-categories',
    section_type: 'categories',
    section_title: 'Shop by mood, look, and self-care ritual',
    subtitle: 'Trending categories',
    display_order: 1,
    active: true,
    configuration_data: {},
  },
  {
    id: 'sec-featured',
    section_type: 'featured_products',
    section_title: 'A polished edit of everyday essentials',
    subtitle: 'Featured Amazon finds',
    display_order: 2,
    active: true,
    configuration_data: { limit: 3 },
  },
  {
    id: 'sec-blog',
    section_type: 'blog',
    section_title: 'Style notes and beauty inspiration',
    subtitle: 'Latest blog posts',
    display_order: 3,
    active: true,
    configuration_data: { limit: 3 },
  },
  {
    id: 'sec-collections',
    section_type: 'collections',
    section_title: 'Curations made for your Pinterest mood board',
    subtitle: 'Popular collections',
    display_order: 4,
    active: true,
    configuration_data: {},
  },
  {
    id: 'sec-newsletter',
    section_type: 'newsletter',
    section_title: 'Get new favourites delivered to your inbox.',
    subtitle: 'Stay in the loop',
    display_order: 5,
    active: true,
    configuration_data: {
      description: 'Join the list for fresh finds, seasonal recommendations, and beauty inspo.',
      button_text: 'Subscribe',
      placeholder: 'Email address',
    },
  },
];

function isPublished(row) {
  if (!row || typeof row !== 'object') return false;
  if (row.published === false || row.active === false) return false;
  return true;
}

function normalizeProduct(row) {
  const catName = row.categories?.name || row.category || row.category_name || '';
  const catSlug = row.categories?.slug || (catName ? catName.toLowerCase().replace(/\s+/g, '-') : '');

  const rawPriceStr = row.price !== undefined && row.price !== null ? String(row.price) : '';
  const priceNum = parseFloat(rawPriceStr.replace(/[^0-9.]/g, ''));
  
  let priceFormatted = '';
  if (!isNaN(priceNum) && priceNum > 0) {
    priceFormatted = `₹${priceNum.toLocaleString('en-IN')}`;
  } else if (rawPriceStr) {
    priceFormatted = rawPriceStr.replace('$', '₹');
    if (!priceFormatted.startsWith('₹') && !priceFormatted.startsWith('Rs')) {
      priceFormatted = `₹${priceFormatted}`;
    }
  }

  return {
    id: row.id ?? row.slug ?? row.name ?? row.title,
    slug: row.slug ?? row.id,
    category: catName,
    category_slug: catSlug,
    title: row.name ?? row.title ?? '',
    description: row.short_description ?? row.description ?? '',
    full_description: row.description ?? '',
    price: priceFormatted,
    numeric_price: priceNum || 0,
    original_price: row.original_price,
    discount: row.discount,
    image: row.image_url ?? row.image ?? row.cover_image ?? '',
    amazon_url: row.amazon_url || row.affiliate_url || '',
    affiliate_url: row.affiliate_url || row.amazon_url || '',
    brand: row.brand || '',
    rating: row.rating || null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    badge: row.featured ? 'Featured' : (row.discount ? `${row.discount}% OFF` : ''),
    featured: Boolean(row.featured),
    published: row.published !== false,
  };
}

function normalizeBlogPost(row) {
  const catName = row.categories?.name || row.category || row.category_name || '';

  return {
    id: row.id ?? row.slug ?? row.title,
    slug: row.slug ?? row.id,
    title: row.title ?? '',
    category: catName,
    excerpt: row.excerpt ?? '',
    image: row.cover_image ?? row.image ?? row.image_url ?? '',
    author: row.author ?? 'Lavs Studio',
    date: row.published_at
      ? new Date(row.published_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : (row.date ?? ''),
    readTime: row.readTime ?? row.read_time ?? '4 min read',
    tags: Array.isArray(row.tags) ? row.tags : [],
    content: Array.isArray(row.content) ? row.content : (typeof row.content === 'string' ? [{ type: 'paragraph', text: row.content }] : []),
    relatedIds: Array.isArray(row.relatedIds) ? row.relatedIds : [],
    published: row.published !== false,
  };
}

function normalizeCategory(row) {
  const slug = row.slug || row.id || (row.name ? row.name.toLowerCase().replace(/\s+/g, '-') : '');
  return {
    id: row.id ?? slug,
    name: row.name ?? row.title ?? '',
    slug: slug,
    image: row.image ?? row.image_url ?? '',
    description: row.description ?? '',
    display_order: row.display_order ?? 0,
    active: row.active !== false,
    to: `/${slug}`,
  };
}

const LOCAL_PRODUCTS_KEY = 'lavsstudio_custom_products';
const DELETED_PRODUCTS_KEY = 'lavsstudio_deleted_product_ids';

export function getDeletedProductIds() {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function getLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveLocalProduct(productData) {
  try {
    const existing = getLocalProducts();
    const prodId = productData.id || `custom-${Date.now()}`;
    const normalized = normalizeProduct({ ...productData, id: prodId });
    
    const index = existing.findIndex((p) => String(p.id) === String(prodId));
    let updated;
    if (index >= 0) {
      existing[index] = { ...existing[index], ...normalized };
      updated = existing;
    } else {
      updated = [normalized, ...existing];
    }
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updated));
    return normalized;
  } catch (err) {
    console.error('saveLocalProduct error:', err);
    return productData;
  }
}

export function deleteLocalProduct(id) {
  try {
    const existing = getLocalProducts();
    const updated = existing.filter((p) => String(p.id) !== String(id));
    localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(updated));

    const deletedIds = getDeletedProductIds();
    if (!deletedIds.includes(String(id))) {
      deletedIds.push(String(id));
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(deletedIds));
    }
  } catch (err) {
    console.error('deleteLocalProduct error:', err);
  }
}

export async function deleteProduct(id) {
  if (supabase && isSupabaseConfigured) {
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase delete product error:', err);
    }
  }
  deleteLocalProduct(id);
}

export async function saveProduct(productPayload) {
  let dbResult = null;
  if (supabase && isSupabaseConfigured) {
    try {
      if (productPayload.id && typeof productPayload.id === 'string' && productPayload.id.includes('-') && !productPayload.id.startsWith('custom-')) {
        const { data, error } = await supabase
          .from('products')
          .update(productPayload)
          .eq('id', productPayload.id)
          .select('*');
        if (!error && data && data.length > 0) dbResult = data[0];
      } else {
        const { data, error } = await supabase
          .from('products')
          .upsert([productPayload])
          .select('*');
        if (!error && data && data.length > 0) dbResult = data[0];
      }
    } catch (err) {
      console.warn('Supabase save failed, storing locally:', err);
    }
  }
  
  const saved = saveLocalProduct({
    ...productPayload,
    ...(dbResult ? { id: dbResult.id } : {}),
  });

  return saved;
}

export async function fetchPublishedProducts() {
  const localProducts = getLocalProducts();
  const deletedIds = getDeletedProductIds();

  const filterDeleted = (list) => list.filter((p) => !deletedIds.includes(String(p.id)));

  if (!supabase || !isSupabaseConfigured) {
    const merged = [...localProducts];
    fallbackProducts.forEach((fp) => {
      const normFp = normalizeProduct(fp);
      if (!merged.some((p) => String(p.id) === String(normFp.id))) {
        merged.push(normFp);
      }
    });
    return filterDeleted(merged);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error || !Array.isArray(data)) {
      console.warn('Supabase products fetch failed, using fallbacks:', error);
      const merged = [...localProducts];
      fallbackProducts.forEach((fp) => {
        const normFp = normalizeProduct(fp);
        if (!merged.some((p) => String(p.id) === String(normFp.id))) {
          merged.push(normFp);
        }
      });
      return filterDeleted(merged);
    }

    const remoteProducts = data.map(normalizeProduct);
    const merged = [...localProducts];
    remoteProducts.forEach((rp) => {
      if (!merged.some((p) => String(p.id) === String(rp.id))) {
        merged.push(rp);
      }
    });

    if (merged.length === 0) {
      return filterDeleted(fallbackProducts.map(normalizeProduct));
    }

    return filterDeleted(merged);
  } catch (err) {
    console.error('fetchPublishedProducts error:', err);
    const merged = [...localProducts];
    fallbackProducts.forEach((fp) => {
      const normFp = normalizeProduct(fp);
      if (!merged.some((p) => String(p.id) === String(normFp.id))) {
        merged.push(normFp);
      }
    });
    return filterDeleted(merged);
  }
}

export async function fetchPublishedBlogPosts() {
  if (!supabase || !isSupabaseConfigured) {
    return fallbackBlogPosts;
  }

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, categories(id, name, slug)')
      .eq('published', true)
      .order('published_at', { ascending: false });

    if (error || !Array.isArray(data)) {
      console.warn('Supabase blog posts fetch failed, using fallbacks:', error);
      return fallbackBlogPosts;
    }

    if (data.length === 0) {
      return [];
    }

    return data.map(normalizeBlogPost);
  } catch (err) {
    console.error('fetchPublishedBlogPosts error:', err);
    return fallbackBlogPosts;
  }
}

export const LOCAL_CATEGORIES_KEY = 'lavsstudio_custom_categories';
export const LOCAL_HOMEPAGE_SECTIONS_KEY = 'lavsstudio_custom_homepage_sections';

export function getLocalCategories() {
  try {
    const raw = localStorage.getItem(LOCAL_CATEGORIES_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function saveLocalCategories(categories) {
  try {
    localStorage.setItem(LOCAL_CATEGORIES_KEY, JSON.stringify(categories));
  } catch (err) {
    console.error('saveLocalCategories error:', err);
  }
}

export function getLocalHomepageSections() {
  try {
    const raw = localStorage.getItem(LOCAL_HOMEPAGE_SECTIONS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function saveLocalHomepageSections(sections) {
  try {
    localStorage.setItem(LOCAL_HOMEPAGE_SECTIONS_KEY, JSON.stringify(sections));
  } catch (err) {
    console.error('saveLocalHomepageSections error:', err);
  }
}

export async function fetchPublishedCategories() {
  const localCats = getLocalCategories();
  if (localCats && Array.isArray(localCats) && localCats.length > 0) {
    return localCats.filter((c) => c.active !== false).map(normalizeCategory);
  }

  const fallbackCats = fallbackBlogCategories.map((name) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    to: `/${name.toLowerCase().replace(/\s+/g, '-')}`,
    active: true,
  }));

  if (!supabase || !isSupabaseConfigured) {
    return fallbackCats;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error || !Array.isArray(data) || data.length === 0) {
      return fallbackCats;
    }

    return data.map(normalizeCategory);
  } catch (err) {
    console.error('fetchPublishedCategories error:', err);
    return fallbackCats;
  }
}

export async function fetchPublishedCollections() {
  if (!supabase || !isSupabaseConfigured) {
    return fallbackCollections;
  }

  try {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('section_type', 'collections')
      .eq('active', true)
      .single();

    if (!error && data?.configuration_data?.items) {
      return data.configuration_data.items;
    }
  } catch (err) {
    console.error('fetchPublishedCollections error:', err);
  }

  return fallbackCollections;
}

export async function fetchSiteSettings() {
  if (!supabase || !isSupabaseConfigured) {
    return fallbackSiteSettings;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('active', true)
      .limit(1);

    if (error || !Array.isArray(data) || data.length === 0) {
      return fallbackSiteSettings;
    }

    const record = data[0];
    return {
      brandName: record.brand_name ?? fallbackSiteSettings.brandName,
      navDisclosure: record.tagline ?? record.nav_disclosure ?? fallbackSiteSettings.navDisclosure,
      footerDescription: record.description ?? record.footer_description ?? fallbackSiteSettings.footerDescription,
      footerDisclaimer: record.footer_text ?? record.footer_disclaimer ?? fallbackSiteSettings.footerDisclaimer,
      contactEmail: record.contact_email ?? '',
      socialLinks: record.social_links ?? {},
      seoTitle: record.seo_title ?? '',
      seoDescription: record.seo_description ?? '',
    };
  } catch (err) {
    console.error('fetchSiteSettings error:', err);
    return fallbackSiteSettings;
  }
}

export async function fetchPublishedHomepageSections() {
  const localSections = getLocalHomepageSections();
  if (localSections && Array.isArray(localSections) && localSections.length > 0) {
    return localSections.filter((s) => s.active !== false);
  }

  if (!supabase || !isSupabaseConfigured) {
    return DEFAULT_HOMEPAGE_SECTIONS;
  }

  try {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (error || !Array.isArray(data) || data.length === 0) {
      return DEFAULT_HOMEPAGE_SECTIONS;
    }

    return data;
  } catch (err) {
    console.error('fetchPublishedHomepageSections error:', err);
    return DEFAULT_HOMEPAGE_SECTIONS;
  }
}

export async function fetchPublishedPage(slug) {
  const fallback = defaultPageCopy[slug];
  if (!fallback) return null;
  return fallback;
}