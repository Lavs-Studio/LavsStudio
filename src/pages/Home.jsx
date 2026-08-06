import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import ProductCard from '../components/ProductCard';
import Seo from '../components/Seo';
import { products, blogPosts, collections } from '../data/products';

const categories = [
  { name: 'Fashion', to: '/fashion', image: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=800&q=80' },
  { name: 'Jewellery', to: '/jewellery', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=800&q=80' },
  { name: 'Hair Care', to: '/hair-care', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80' },
  { name: 'Skin Care', to: '/skin-care', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80' },
];

export default function Home() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lavs Studio',
    url: 'https://www.lavsstudio.com/',
    description: 'Discover Amazon Finds, affordable fashion, college girl fashion, hair care, skincare, jewellery and Pinterest-worthy inspiration at Lavs Studio.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.lavsstudio.com/categories',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Layout>
      <Seo
        title="Amazon Finds, Affordable Fashion & Beauty"
        description="Explore Amazon Finds, affordable fashion, college girl fashion, hair care, skincare, jewellery and Pinterest-inspired recommendations by Lavs Studio."
        schema={schema}
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose">Curated for your soft glow</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
            Discover elevated essentials for beauty, fashion, and everyday luxury.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-espresso/70">
            Lavs Studio brings together timeless favourites, Pinterest-worthy finds, and thoughtful recommendations in one calm, premium space.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/amazon-finds" className="rounded-full bg-espresso px-6 py-3 text-white transition hover:bg-rose">
              Explore Amazon Finds
            </Link>
            <Link to="/categories" className="rounded-full border border-rose/30 px-6 py-3 text-espresso transition hover:border-rose hover:text-rose">
              Browse Categories
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-[36px] bg-cream p-4 shadow-soft">
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80"
            alt="Editorial lifestyle and fashion inspiration for Lavs Studio"
            className="h-[480px] w-full rounded-[28px] object-cover"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-full bg-rose px-4 py-2 text-sm text-white">Pin This</button>
            <button className="rounded-full border border-rose/20 px-4 py-2 text-sm text-espresso/70">Share</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Trending categories" title="Shop by mood, look, and self-care ritual" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.name} to={category.to} className="group overflow-hidden rounded-[24px] border border-rose/20 bg-white shadow-soft">
              <img src={category.image} alt={`${category.name} category on Lavs Studio`} className="h-48 w-full object-cover transition duration-300 group-hover:scale-105" />
              <div className="p-5">
                <h3 className="text-xl font-semibold">{category.name}</h3>
                <p className="mt-2 text-sm text-espresso/70">A refined edit for your daily favourites.</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Featured Amazon finds" title="A polished edit of everyday essentials" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Latest blog posts" title="Style notes and beauty inspiration" />
        <div className="grid gap-6 md:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[24px] border border-rose/20 bg-white shadow-soft">
              <img src={post.image} alt={`${post.title} blog post on Lavs Studio`} className="h-48 w-full object-cover" />
              <div className="p-5">
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="mt-2 text-sm text-espresso/70">{post.excerpt}</p>
                <Link to="/blog" className="mt-4 inline-block text-sm font-semibold text-rose">Read more →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Popular collections" title="Curations made for your Pinterest mood board" />
        <div className="grid gap-6 md:grid-cols-3">
          {collections.map((collection) => (
            <div key={collection.title} className="rounded-[24px] border border-rose/20 bg-cream p-8 shadow-soft">
              <h3 className="text-2xl font-semibold">{collection.title}</h3>
              <p className="mt-3 text-sm text-espresso/70">{collection.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-rose/20 bg-white p-8 text-center shadow-soft sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose">Stay in the loop</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Get new favourites delivered to your inbox.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-espresso/70">Join the list for fresh finds, seasonal recommendations, and beauty inspo.</p>
          <div className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
            <input className="flex-1 rounded-full border border-rose/20 px-4 py-3 outline-none" placeholder="Email address" />
            <button className="rounded-full bg-rose px-5 py-3 text-white">Subscribe</button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
