import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo from '../components/Seo';
import useRemoteData from '../hooks/useRemoteData';
import { fetchPublishedBlogPosts } from '../lib/content';

export default function BlogPost() {
  const [blogPosts, isLoading, error] = useRemoteData(fetchPublishedBlogPosts, []);
  const { slug } = useParams();

  const post = blogPosts.find((item) => item.slug === slug || item.id === slug);

  if (isLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl px-4 py-20 animate-pulse space-y-6">
          <div className="h-6 w-1/4 rounded bg-[#f3e8ff]" />
          <div className="h-10 w-3/4 rounded bg-[#f3e8ff]" />
          <div className="h-96 w-full rounded-[28px] bg-[#f3e8ff]/70" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <Seo title="Article Not Found" description="The requested article could not be found." />
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#2e1f3b]">Article not found</h1>
          <p className="mt-2 text-[#2e1f3b]/75">This article may have been unpublished or removed.</p>
          <Link to="/blog" className="mt-6 inline-block font-semibold text-[#ec4899] hover:underline">
            ← Back to all articles
          </Link>
        </section>
      </Layout>
    );
  }

  const relatedPosts = blogPosts
    .filter((item) => item.slug !== slug && item.id !== post.id)
    .slice(0, 3);

  return (
    <Layout>
      <Seo title={post.title} description={post.excerpt} />
      <article className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-[#ec4899]/30 bg-[#fde8f3] p-3 text-center text-xs text-[#ec4899]">
            Notice: Offline mode.
          </div>
        )}

        <header className="mx-auto max-w-3xl text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">{post.category || 'Article'}</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight text-[#2e1f3b] sm:text-5xl">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium text-[#2e1f3b]/60">
            <span>By {post.author || 'Lavs Studio'}</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime || '3 min read'}</span>
          </div>
        </header>

        {post.image && (
          <div className="mt-10 overflow-hidden rounded-[32px] border border-[#e9d5ff]/80 bg-white/90 p-3 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
            <img
              src={post.image}
              alt={`${post.title} cover image`}
              className="h-[500px] w-full rounded-[28px] object-cover"
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-3 pb-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ec4899]">Pinterest Cover Image</p>
                <p className="text-sm text-[#2e1f3b]/75">Vertical, save-worthy and optimized for Pinterest boards.</p>
              </div>
              <a
                href="https://in.pinterest.com/lavsstudio/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-95 shadow-md shadow-[#f472b6]/20"
              >
                Save to Pinterest
              </a>
            </div>
          </div>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.7fr_0.8fr]">
          <div>
            {Array.isArray(post.content) && post.content.some((item) => item.type === 'heading') && (
              <nav aria-label="Table of contents" className="mb-8 rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-[#2e1f3b]">Table of Contents</h2>
                <ul className="mt-4 space-y-2 text-sm text-[#2e1f3b]/80">
                  {post.content
                    .filter((item) => item.type === 'heading')
                    .map((item, index) => (
                      <li key={item.text + index}>• {item.text}</li>
                    ))}
                </ul>
              </nav>
            )}

            <div className="space-y-6 text-lg leading-relaxed text-[#2e1f3b]/85">
              {Array.isArray(post.content) && post.content.length > 0 ? (
                post.content.map((item, index) => {
                  if (item.type === 'heading') {
                    return <h2 key={item.text + index} className="mt-8 text-2xl font-bold text-[#2e1f3b]">{item.text}</h2>;
                  }
                  if (item.type === 'quote') {
                    return (
                      <blockquote key={index} className="my-6 border-l-4 border-[#ec4899] bg-[#fde8f3]/60 p-5 italic text-[#2e1f3b] rounded-r-2xl border-y border-r border-[#e9d5ff]/60">
                        "{item.text}"
                      </blockquote>
                    );
                  }
                  if (item.type === 'list') {
                    return <li key={index} className="ml-4 list-disc text-[#2e1f3b]/85">{item.text}</li>;
                  }
                  return <p key={index}>{item.text}</p>;
                })
              ) : (
                <p>{post.excerpt}</p>
              )}
            </div>

            <div className="mt-10 rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
              <h2 className="text-xl font-bold text-[#2e1f3b]">Infographic & Highlights</h2>
              <p className="mt-2 text-sm text-[#2e1f3b]/75">A quick visual summary of the key ideas in this article, ideal for Pinterest saves and quick scanning.</p>
              <div className="mt-4 rounded-[20px] border border-[#e9d5ff]/60 bg-[#f3e8ff]/40 p-4 text-sm text-[#2e1f3b]/80 space-y-1">
                <p>• Soft, elevated styling</p>
                <p>• Budget-friendly picks</p>
                <p>• Easy outfit formulas</p>
                <p>• Pinterest-friendly look ideas</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="https://in.pinterest.com/lavsstudio/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-6 py-2.5 text-xs font-semibold text-white transition hover:opacity-95 shadow-md shadow-[#f472b6]/20"
              >
                Pin It on Pinterest
              </a>
            </div>
          </div>

          <aside className="space-y-6">
            {relatedPosts.length > 0 && (
              <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-[#2e1f3b]">Related Articles</h2>
                <ul className="mt-4 space-y-3 text-sm text-[#2e1f3b]/80">
                  {relatedPosts.map((item) => (
                    <li key={item.id}>
                      <Link to={`/blog/${item.slug || item.id}`} className="hover:text-[#ec4899] transition font-medium">
                        • {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 p-6 shadow-xl shadow-purple-950/5 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-[#2e1f3b]">Newsletter</h2>
              <p className="mt-2 text-sm text-[#2e1f3b]/75">Get fresh fashion and beauty finds directly to your inbox.</p>
              <div className="mt-4 flex flex-col gap-3">
                <input className="rounded-full border border-[#e9d5ff] bg-white/80 px-4 py-3 text-sm text-[#2e1f3b] placeholder-[#2e1f3b]/40 outline-none focus:border-[#ec4899]" placeholder="Email address" />
                <button className="rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 shadow-md shadow-[#f472b6]/20">Sign up</button>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </Layout>
  );
}


