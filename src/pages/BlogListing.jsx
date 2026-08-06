import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import BlogCard from '../components/BlogCard';
import Seo from '../components/Seo';
import { blogPosts, categories } from '../blog/posts';

export default function BlogListing() {
  return (
    <Layout>
      <Seo
        title="Blog"
        description="Explore Pinterest-inspired blog articles on affordable fashion, beauty, skincare, hair care, jewellery and lifestyle essentials."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Blog" title="Style ideas, beauty notes, and everyday inspiration" description="Fresh reads for college girls and young women who love soft, elevated living." />

        <div className="mb-10 flex flex-wrap gap-3">
          {categories.map((category) => (
            <span key={category} className="rounded-full border border-rose/20 bg-white px-4 py-2 text-sm text-espresso/70">
              {category}
            </span>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
