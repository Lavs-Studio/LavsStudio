import ViewOnAmazonButton from './ViewOnAmazonButton';

export default function ProductCard({ product }) {
  const affiliateUrl = product.affiliate_url || product.amazon_url || product.amazonLink || '#';

  return (
    <article className="overflow-hidden rounded-[28px] border border-[#e9d5ff]/80 bg-white/90 backdrop-blur-xl shadow-xl shadow-purple-950/5 transition-all duration-300 hover:-translate-y-1 hover:border-[#f472b6] hover:shadow-2xl flex flex-col h-full relative group">
      {/* Discount or Badge Header */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10 rounded-full bg-gradient-to-r from-[#f472b6] to-[#c084fc] px-3 py-1 text-[11px] font-bold text-white shadow-md">
          {product.badge}
        </div>
      )}

      {/* Image Container */}
      <div className="h-60 w-full overflow-hidden bg-[#f3e8ff]/40 relative">
        <img
          src={product.image}
          alt={`${product.title || product.name} featured on Lavs Studio`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80';
          }}
        />
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow space-y-3">
        {/* Category & Brand */}
        <div className="flex items-center justify-between text-xs text-[#ec4899] font-semibold uppercase tracking-[0.2em]">
          <span>{product.category || 'Curated Find'}</span>
          {product.brand && <span className="text-[#2e1f3b]/50 font-normal">{product.brand}</span>}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[#2e1f3b] leading-snug line-clamp-2">
          {product.title || product.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-[#2e1f3b]/75 flex-grow line-clamp-3 leading-relaxed">
          {product.description}
        </p>

        {/* Rating if available */}
        {product.rating && (
          <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
            <span>★ {product.rating}</span>
            <span className="text-[#2e1f3b]/50 font-normal">(Amazon Customer Rating)</span>
          </div>
        )}

        {/* Pricing Block */}
        <div className="pt-3 border-t border-[#e9d5ff]/60 flex items-baseline justify-between">
          <div>
            <span className="text-xl font-bold text-[#2e1f3b]">{product.price}</span>
            {product.original_price && (
              <span className="ml-2 text-xs text-[#2e1f3b]/40 line-through">
                ₹{parseFloat(String(product.original_price).replace(/[^0-9.]/g, '')).toLocaleString('en-IN')}
              </span>
            )}
            <p className="text-[10px] text-[#2e1f3b]/40 font-light mt-0.5">
              *Prices on Amazon subject to change
            </p>
          </div>
        </div>

        {/* View on Amazon CTA Button */}
        <div className="pt-2">
          <ViewOnAmazonButton url={affiliateUrl} className="w-full" />
        </div>
      </div>
    </article>
  );
}



