import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Seo from '../components/Seo';
import { blogPosts } from '../blog/posts';

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.id === slug);

  if (!post) {
    return (
      <Layout>
        <Seo title="Article Not Found" description="The requested article could not be found." />
        <section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold">Article not found</h1>
          <Link to="/blog" className="mt-6 inline-block text-rose">Back to blog</Link>
        </section>
      </Layout>
    );
  }

  const relatedPosts = blogPosts.filter((item) => post.relatedIds.includes(item.id));

  return (
    <Layout>
      <Seo title={post.title} description={post.excerpt} />
      <article className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <header className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose">{post.category}</p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-espresso/70">
            <span>By {post.author}</span>
            <span>•</span>
            <span>{post.date}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
        </header>

        <div className="mt-10 overflow-hidden rounded-[32px] border border-rose/20 bg-white p-3 shadow-soft">
          <img src={post.image} alt={`${post.title} Pinterest cover image`} className="h-[520px] w-full rounded-[28px] object-cover" />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2 pb-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose">Pinterest Cover Image</p>
              <p className="text-sm text-espresso/70">Vertical, save-worthy and optimized for Pinterest boards.</p>
            </div>
            <button className="rounded-full bg-rose px-4 py-2 text-sm text-white">Save to Pinterest</button>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.7fr_0.8fr]">
          <div>
            <nav aria-label="Table of contents" className="mb-8 rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Table of Contents</h2>
              <ul className="mt-4 space-y-2 text-sm text-espresso/70">
                {post.content.filter((item) => item.type === 'heading').map((item, index) => (
                  <li key={item.text + index}>• {item.text}</li>
                ))}
              </ul>
            </nav>

            <div className="space-y-6 text-lg leading-8 text-espresso/80">
              {post.content.map((item, index) => {
                if (item.type === 'heading') {
                  return <h2 key={item.text + index} className="mt-6 text-2xl font-semibold">{item.text}</h2>;
                }
                return <p key={item.text + index}>{item.text}</p>;
              })}
            </div>

            <div className="mt-10 rounded-[24px] border border-rose/20 bg-cream p-6 shadow-soft">
              <h2 className="text-xl font-semibold">Infographic Section</h2>
              <p className="mt-3 text-sm text-espresso/70">A quick visual summary of the key ideas in this article, ideal for Pinterest saves and quick scanning.</p>
              <div className="mt-4 rounded-[20px] border border-white/70 bg-white p-4 text-sm text-espresso/70">
                • Soft, elevated styling<br />
                • Budget-friendly picks<br />
                • Easy outfit formulas<br />
                • Pinterest-friendly look ideas
              </div>
            </div>

            <div className="mt-8 rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold">Product Recommendation Section</h2>
              <p className="mt-3 text-sm text-espresso/70">Suggested picks for this article’s theme, styled to feel shoppable and inspiring.</p>
              <div className="mt-4 rounded-[20px] bg-cream p-4 text-sm text-espresso/70">
                Try a cute dress, simple jewellery, and a soft bag to complete the look.
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="rounded-full bg-espresso px-4 py-2 text-sm text-white">Share</button>
              <button className="rounded-full border border-rose/20 px-4 py-2 text-sm text-espresso/80">Pin It</button>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Related Pins</h2>
              <ul className="mt-4 space-y-3 text-sm text-espresso/70">
                {relatedPosts.map((item) => (
                  <li key={item.id}>
                    <Link to={`/blog/${item.id}`} className="hover:text-rose">• {item.title}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[24px] border border-rose/20 bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold">Newsletter</h2>
              <p className="mt-2 text-sm text-espresso/70">Get fresh fashion and beauty finds directly to your inbox.</p>
              <div className="mt-4 flex flex-col gap-3">
                <input className="rounded-full border border-rose/20 px-4 py-3" placeholder="Email address" />
                <button className="rounded-full bg-rose px-4 py-3 text-white">Sign up</button>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </Layout>
  );
}
