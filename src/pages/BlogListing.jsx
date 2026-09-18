import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import BlogCard from '../components/BlogCard';
import Seo from '../components/Seo';
import useRemoteData from '../hooks/useRemoteData';
import { fetchPublishedBlogPosts, fetchPublishedCategories } from '../lib/content';

export default function BlogListing() {
  const [blogPosts, isLoading, error] = useRemoteData(fetchPublishedBlogPosts, []);
  const [categories] = useRemoteData(fetchPublishedCategories, []);

  return (
    <Layout>
      <Seo
        title="Blog"
        description="Explore Pinterest-inspired blog articles on affordable fashion, beauty, skincare, hair care, jewellery and lifestyle essentials."
      />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Blog"
          title="Style ideas, beauty notes, and everyday inspiration"
          description="Fresh reads for college girls and young women who love soft, elevated living."
        />

        {error && (
          <div className="mb-8 rounded-2xl border border-[#ec4899]/30 bg-[#fde8f3] p-4 text-center text-sm text-[#ec4899]">
            Unable to connect to live database.
          </div>
        )}

        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-3">
            {categories.map((cat) => (
              <span
                key={cat.id || cat.name}
                className="rounded-full border border-[#e9d5ff] bg-white/80 px-4 py-2 text-sm font-medium text-[#2e1f3b]/80 shadow-sm backdrop-blur-xl"
              >
                {cat.name || cat}
              </span>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-4 backdrop-blur-xl"
              >
                <div className="h-48 w-full rounded-[20px] bg-[#f3e8ff]/70" />
                <div className="mt-4 h-5 w-3/4 rounded bg-[#f3e8ff]" />
                <div className="mt-2 h-4 w-1/2 rounded bg-[#f3e8ff]/60" />
              </div>
            ))}
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="rounded-[32px] border border-[#e9d5ff]/80 bg-white/90 p-12 text-center shadow-xl shadow-purple-950/5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">
              Blog Updates
            </p>
            <h3 className="mt-2 text-2xl font-bold text-[#2e1f3b]">
              No published articles found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#2e1f3b]/75">
              Check back soon! Fresh articles and style notes are published regularly.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {blogPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

      </section>
    </Layout>
  );
}

