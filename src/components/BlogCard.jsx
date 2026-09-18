import { Link } from 'react-router-dom';

export default function BlogCard({ post }) {
  const postLink = `/blog/${post.slug || post.id}`;

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 backdrop-blur-xl shadow-xl shadow-purple-950/5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f472b6]/60 hover:shadow-purple-950/10 flex flex-col h-full">
      <div className="h-56 w-full overflow-hidden bg-[#f3e8ff]/50 relative">
        <img
          src={post.image}
          alt={`${post.title} on Lavs Studio`}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] font-semibold text-[#ec4899]">
          {post.category || 'Article'}
        </p>
        <h3 className="font-display text-xl font-semibold text-[#2e1f3b] leading-snug line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-[#2e1f3b]/75 flex-grow line-clamp-3 leading-relaxed">
          {post.excerpt}
        </p>
        <div className="pt-3 border-t border-[#e9d5ff]/60 flex items-center justify-between text-xs text-[#2e1f3b]/60">
          <span>{post.readTime || '3 min read'}</span>
          <Link
            to={postLink}
            className="font-semibold text-[#ec4899] hover:text-[#a855f7] hover:underline"
          >
            Read article →
          </Link>
        </div>
      </div>
    </article>
  );
}



