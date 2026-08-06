import { Link } from 'react-router-dom';

export default function BlogCard({ post }) {
  return (
    <article className="overflow-hidden rounded-[24px] border border-rose/20 bg-white shadow-soft">
      <img src={post.image} alt={`${post.title} on Lavs Studio`} className="h-64 w-full object-cover" />
      <div className="p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-rose">{post.category}</p>
        <h3 className="mt-2 font-display text-xl font-semibold">{post.title}</h3>
        <p className="mt-3 text-sm text-espresso/70">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-espresso/60">
          <span>{post.readTime}</span>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-rose/20 px-3 py-1 text-xs text-espresso/70">Save</button>
            <Link to={`/blog/${post.id}`} className="font-semibold text-rose">Read more</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
