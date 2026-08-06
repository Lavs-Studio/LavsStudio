import Layout from '../components/Layout';
import SectionTitle from '../components/SectionTitle';
import Seo from '../components/Seo';
import { blogPosts } from '../data/products';

export default function Blog() {
  return (
    <Layout>
      <Seo
        title="Blog"
        description="Read style guides, beauty inspiration, and Pinterest finds for college girl fashion and everyday elegance."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Blog" title="Stories, guides, and soft-glam inspiration" description="Fresh reads designed to feel personal and timeless." />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {blogPosts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[24px] border border-rose/20 bg-white shadow-soft">
              <img src={post.image} alt={`${post.title} article on Lavs Studio`} className="h-56 w-full object-cover" />
              <div className="p-5">
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <p className="mt-2 text-sm text-espresso/70">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Layout>
  );
}
